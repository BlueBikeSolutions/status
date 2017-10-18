#!/usr/bin/env python3

import datetime
import json
import logging
import os
import subprocess
import sys


CONDITION_NAMES = dict(
    deploy='Available',
    job='Complete',
)


def kubectl_get(*args):
    return json.loads(subprocess.check_output([
        'kubectl',
        'get', '-o', 'json',
        *args,
    ]))


def check_data(data, condition_name):
    for condition in data['status']['conditions']:
        if condition['type'].lower() != condition_name.lower():
            continue
        print(condition)
        return condition['status'].lower() == 'true', condition.get('message', None)

    return False, '%s condition not found' % condition_name


def check_single(res_type, name, namespace):
    if namespace:
        data = kubectl_get(res_type, name, '-n', namespace)
    else:
        data = kubectl_get(res_type, name)
    return check_data(data, CONDITION_NAMES[res_type])


def check_all(res_type, match, namespace):
    if namespace:
        data_list = kubectl_get(res_type, '-l', match, '-n', namespace)
    else:
        data_list = kubectl_get(res_type, '-l', match)
    return [
        check_data(data, CONDITION_NAMES[res_type])
        for data in data_list['items']
    ]

def add_status(data, group, okay, message):
    data = data['services']
    group_data = data[group] = data.get(group, {
        'okay': True,
        'errors': [],
        'messages': [],
    })
    group_data['okay'] = group_data['okay'] and okay
    if message is not None:
        group_data['messages' if okay else 'errors'].append(message)


def main():
    logging.basicConfig(level=logging.INFO)

    filename = sys.argv[1]
    data = {
        'time': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'services': {},
    }

    for arg in sys.argv[2:]:
        logging.info("Checking '%s'", arg)
        namespace = None
        try:
            parts = arg.split(':')
            if len(parts) == 3
                group, res_type, res_name = parts.split(':')
            else:
                group, res_type, namespace, res_name = parts.split(':')

        except Exception:
            logging.exception("Couldn't check service '%s'" % arg)
            add_status(data, '_', False, "Error checking '%'" % arg)

        else:
            try:
                if res_type[-1] == 's':
                    res_type = res_type[:-1]
                    plural = True
                else:
                    plural = False

                if res_type in CONDITION_NAMES:
                    if plural:
                        for okay, message in check_all(res_type, res_name, namespace):
                            add_status(data, group, okay, message)
                    else:
                        okay, message = check_single(res_type, res_name, namespace)
                        add_status(data, group, okay, message)

                else:
                    add_status(data, group, False, 'Unknown type')

            except Exception:
                logging.exception("Couldn't check service '%s'" % arg)
                add_status(data, group, False, 'Error checking')


    bucket_uri = 's3://{env}.status.bluebike.hosting/{name}.json'.format(
        env=os.environ['ENVIRONMENT'],
        name=filename,
    )
    logging.info('Writing to S3')
    proc = subprocess.Popen(
        [
            'aws', 's3', 'cp',
            '-', bucket_uri,
            '--content-type', 'application/json',
        ],
        stdin=subprocess.PIPE,
    )
    out, err = proc.communicate(json.dumps(data).encode())
    proc.wait()

    if proc.returncode != 0:
        logging.error("Couldn't upload to S3!")
        sys.exit(1)


if __name__ == '__main__':
    main()
