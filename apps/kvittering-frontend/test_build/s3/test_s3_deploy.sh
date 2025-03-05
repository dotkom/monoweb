#!/bin/bash

# S3 Deployment Script for Vite Application
# This script creates an S3 bucket and deploys a Vite application to it

# Exit on error
set -e

# Configuration - CHANGE THESE VALUES
BUCKET_NAME="kvittering5.online.ntnu.no"  # Must be globally unique
REGION="eu-north-1"                  # AWS region
DIST_DIR="../../dist"

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

# Check if the dist directory exists
if [ ! -d $DIST_DIR ]; then
    echo -e "${RED}Error: dist directory not found. Please build your Vite application first.${NC}"
    echo -e "${YELLOW}Run 'npm run build' or 'pnpm build' in your project root.${NC}"
    exit 1
fi

echo -e "${BLUE}=== Deploying Vite application to S3 ===${NC}"
echo -e "${YELLOW}Bucket Name: ${BUCKET_NAME}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"

# Check if bucket already exists
if aws s3api head-bucket --bucket "${BUCKET_NAME}" --region "${REGION}" 2>/dev/null; then
    echo -e "${YELLOW}Bucket ${BUCKET_NAME} already exists.${NC}"
else
    echo -e "${GREEN}Creating bucket ${BUCKET_NAME}...${NC}"
    aws s3api create-bucket \
        --bucket "${BUCKET_NAME}" \
        --region "${REGION}" \
        --create-bucket-configuration LocationConstraint="${REGION}" 2>/dev/null || \
    aws s3api create-bucket \
        --bucket "${BUCKET_NAME}" \
        --region "${REGION}" \
    
    echo -e "${GREEN}Bucket created successfully.${NC}"
fi

# Disable Block Public Access settings
echo -e "${GREEN}Disabling Block Public Access settings...${NC}"
aws s3api put-public-access-block \
    --bucket "${BUCKET_NAME}" \
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
    --region "${REGION}"

# Enable static website hosting
echo -e "${GREEN}Configuring bucket for static website hosting...${NC}"
aws s3api put-bucket-website \
    --bucket "${BUCKET_NAME}" \
    --website-configuration '{"IndexDocument":{"Suffix":"index.html"},"ErrorDocument":{"Key":"index.html"}}' \
    --region "${REGION}" \

# Set bucket policy for public access
echo -e "${GREEN}Setting bucket policy for public access...${NC}"
POLICY='{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::'${BUCKET_NAME}'/*"
        }
    ]
}'

aws s3api put-bucket-policy \
    --bucket "${BUCKET_NAME}" \
    --policy "$POLICY" \
    --region "${REGION}" \

# Configure CORS
echo -e "${GREEN}Configuring CORS...${NC}"
CORS='{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": []
        }
    ]
}'

aws s3api put-bucket-cors \
    --bucket "${BUCKET_NAME}" \
    --cors-configuration "$CORS" \
    --region "${REGION}" \

# Upload files with correct MIME types
echo -e "${GREEN}Uploading HTML files...${NC}"
aws s3 sync $DIST_DIR "s3://${BUCKET_NAME}" \
    --exclude "*" \
    --include "*.html" \
    --content-type "text/html" \
    --region "${REGION}" \

echo -e "${GREEN}Uploading CSS files...${NC}"
aws s3 sync $DIST_DIR "s3://${BUCKET_NAME}" \
    --exclude "*" \
    --include "*.css" \
    --content-type "text/css" \
    --region "${REGION}" \

echo -e "${GREEN}Uploading JavaScript files...${NC}"
aws s3 sync $DIST_DIR "s3://${BUCKET_NAME}" \
    --exclude "*" \
    --include "*.js" \
    --content-type "application/javascript" \
    --region "${REGION}" \

echo -e "${GREEN}Uploading SVG files...${NC}"
aws s3 sync $DIST_DIR "s3://${BUCKET_NAME}" \
    --exclude "*" \
    --include "*.svg" \
    --content-type "image/svg+xml" \
    --region "${REGION}" \

echo -e "${GREEN}Uploading remaining files...${NC}"
aws s3 sync $DIST_DIR "s3://${BUCKET_NAME}" \
    --exclude "*.html" \
    --exclude "*.css" \
    --exclude "*.js" \
    --exclude "*.svg" \
    --region "${REGION}" \

# Get the website URL
WEBSITE_URL="http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com"

echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo -e "${GREEN}Your website is now available at:${NC}"
echo -e "${BLUE}${WEBSITE_URL}${NC}"
echo -e "${YELLOW}Note: It might take a few minutes for the changes to propagate.${NC}"
echo -e "${YELLOW}If you need CloudFront for SPA routing, please set it up in the AWS Console or extend this script.${NC}"

# Optional: Open the website in the default browser
if command -v open &> /dev/null; then
    echo -e "${GREEN}Opening website in browser...${NC}"
    open "${WEBSITE_URL}"
elif command -v xdg-open &> /dev/null; then
    echo -e "${GREEN}Opening website in browser...${NC}"
    xdg-open "${WEBSITE_URL}"
elif command -v start &> /dev/null; then
    echo -e "${GREEN}Opening website in browser...${NC}"
    start "${WEBSITE_URL}"
fi 
