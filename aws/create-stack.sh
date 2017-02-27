#!/bin/bash

# Check if the AWS CLI is in the PATH
found=$(which aws)
if [ -z "$found" ]; then
  echo "ERROR: Please install the AWS CLI: http://aws.amazon.com/cli/"
  exit 1
fi

# Check if jq is in the PATH
found=$(which jq)
if [ -z "$found" ]; then
  echo "ERROR: Please install jq: http://stedolan.github.io/jq/"
  exit 1
fi

# Read other configuration from config.json
IOT_REST_API_ENDPOINT=$(aws iot describe-endpoint | jq -r '.endpointAddress')

# Create CloudFormation Stack
aws cloudformation create-stack \
    --stack-name MiniCloudMonitor \
    --template-body file://cfn-template.json \
    --parameters ParameterKey=IotRestApiEndpoint,ParameterValue=$IOT_REST_API_ENDPOINT \
    --capabilities CAPABILITY_NAMED_IAM
