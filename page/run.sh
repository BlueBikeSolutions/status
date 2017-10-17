#!/bin/bash
set -e
yarn run build

for environment in prod nonprod; do
  aws s3 sync /code/build/ s3://$environment.status.bluebike.hosting/
  aws s3 cp /code/services/$environment.json s3://$environment.status.bluebike.hosting/services.json
done
