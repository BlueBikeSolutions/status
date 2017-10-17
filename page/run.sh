#!/bin/bash
set -e
yarn run build
aws s3 sync /code/dist/ s3://bbs-status-${ENVIRONMENT}/
