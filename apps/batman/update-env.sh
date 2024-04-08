#!/bin/bash

# Fetch secrets from Doppler and format them for the AWS CLI
formatted_secrets=$(doppler secrets download --format=env --no-file | python3 -c "import sys; print(','.join(['='.join([k.strip(), v.strip()]) for k,v in (line.split('=') for line in sys.stdin)]))")

# Update the AWS Lambda function's environment variables
aws lambda update-function-configuration --function-name batman-staging --environment "Variables={${formatted_secrets}}"
