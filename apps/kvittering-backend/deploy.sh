#!/bin/bash

S3_ARTIFACTS_BUCKET=artifacts.online.ntnu.no
PROJECT_NAME=receipt-upload
LAMBDA_FUNCTION_NAME=receipt-lambda

# Create a temporary directory for the package
mkdir -p package

# Install dependencies into the package directory
# pip install -r requirements.txt --target ./package
pip install --target ./package pillow --platform manylinux2014_x86_64 --only-binary=:all: --upgrade

# Copy your Lambda function code into the package
# cp src/index.py package/
cp -r src/* package/

# Create the ZIP file
cd package
zip -r ../deployment.zip .
cd ..

# Clean up
rm -rf package

# Upload to S3
aws s3 cp deployment.zip s3://$S3_ARTIFACTS_BUCKET/$PROJECT_NAME/lambda.zip

echo "Deployment complete! Lambda package uploaded to s3://$S3_ARTIFACTS_BUCKET/$PROJECT_NAME/lambda.zip" 

aws lambda update-function-code --function-name $LAMBDA_FUNCTION_NAME --s3-bucket $S3_ARTIFACTS_BUCKET --s3-key $PROJECT_NAME/lambda.zip

echo "Waiting for Lambda function to be fully updated..."
while true; do
    STATUS=$(aws lambda get-function --function-name $LAMBDA_FUNCTION_NAME --query 'Configuration.[State,LastUpdateStatus]' --output text)
    if [[ $STATUS == *"Active"* ]] && [[ $STATUS == *"Successful"* ]]; then
        echo "Lambda function is now live and ready!"
        break
    fi
    echo "Still updating... Current status: $STATUS"
    sleep 3
done