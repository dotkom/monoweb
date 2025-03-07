#!/bin/bash

# S3 Cleanup Script
# This script removes the S3 bucket and all its contents

# Exit on error
set -e

# Configuration - MAKE SURE THESE MATCH YOUR DEPLOYMENT SCRIPT
BUCKET_NAME="kvittering5.online.ntnu.no"  # Must match the bucket name in test_s3_deploy.sh
REGION="eu-north-1"                  # Must match the region in test_s3_deploy.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

echo -e "${BLUE}=== Cleaning up S3 resources ===${NC}"
echo -e "${YELLOW}Bucket Name: ${BUCKET_NAME}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"

# Check if bucket exists
if ! aws s3api head-bucket --bucket "${BUCKET_NAME}" --region "${REGION}" 2>/dev/null; then
    echo -e "${YELLOW}Bucket ${BUCKET_NAME} does not exist. Nothing to clean up.${NC}"
    exit 0
fi

# Confirm before proceeding
echo -e "${RED}WARNING: This will permanently delete all contents of bucket ${BUCKET_NAME}${NC}"
read -p "Are you sure you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Operation cancelled.${NC}"
    exit 0
fi

# Remove bucket website configuration
echo -e "${GREEN}Removing website configuration...${NC}"
aws s3api delete-bucket-website \
    --bucket "${BUCKET_NAME}" \
    --region "${REGION}" \
    || true

# Remove bucket policy
echo -e "${GREEN}Removing bucket policy...${NC}"
aws s3api delete-bucket-policy \
    --bucket "${BUCKET_NAME}" \
    --region "${REGION}" \
    || true

# Remove bucket CORS configuration
echo -e "${GREEN}Removing CORS configuration...${NC}"
aws s3api delete-bucket-cors \
    --bucket "${BUCKET_NAME}" \
    --region "${REGION}" \
    || true

# Empty the bucket (required before deletion)
echo -e "${GREEN}Emptying bucket contents...${NC}"
aws s3 rm "s3://${BUCKET_NAME}" \
    --recursive \
    --region "${REGION}" \

# Delete the bucket
echo -e "${GREEN}Deleting bucket...${NC}"
aws s3api delete-bucket \
    --bucket "${BUCKET_NAME}" \
    --region "${REGION}" \

echo -e "${GREEN}=== Cleanup Complete ===${NC}"
echo -e "${GREEN}All resources associated with ${BUCKET_NAME} have been removed.${NC}" 
