# Testing Production Builds Locally

This directory provides simple setups for testing your Vite production build locally in two different environments:

1. **Webserver**: Using Docker + Nginx to simulate a web server
2. **S3**: Host on s3 bucket

## Purpose

When developing SPAs with Vite, testing the actual production build locally can reveal issues that don't appear in development mode:

- Asset loading problems with hashed filenames
- MIME type configuration issues
- SPA routing edge cases
- Cache header behaviors
- Deployment-specific configurations

## Webserver Setup (Docker + Nginx)

```bash
# Build your app
pnpm run build

# Start the container
cd test_build/webserver
docker compose up
```

Your production build will be available at `http://localhost:8080`

## S3 Setup

```bash
# Build your app
pnpm run build

# Deploy to S3 (configure bucket name and region in the script first)
cd test_build/s3
./test_s3_deploy.sh

# To clean up the S3 resources when done
./kill.sh
```