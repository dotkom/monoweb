#!/bin/bash

# S3 Deployment Script for Vite Application
# This script creates an S3 bucket and deploys a Vite application to it

# Exit on error
set -e

pnpm build

# Configuration - CHANGE THESE VALUES
BUCKET_NAME="splash.online.ntnu.no"  # Must be globally unique
REGION="eu-north-1"                  # AWS region
DIST_DIR="dist"

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
WEBSITE_URL="http://${BUCKET_NAME}.s3-website.eu-north-1.amazonaws.com/test"

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

aws cloudfront create-invalidation --distribution-id E3J930LEDCHBY3 --paths '/*'
