#!/bin/bash

# Check if the AWS CLI is in the PATH
found=$(which aws)
if [ -z "$found" ]; then
  echo "ERROR: Please install the AWS CLI: http://aws.amazon.com/cli/"
  exit 1
fi

# Delete CloudFormation Stack
aws cloudformation delete-stack --stack-name MiniCloudMonitor
