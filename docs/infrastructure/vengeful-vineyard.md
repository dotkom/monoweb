# Vengeful Vineyard Deployment

The Vengeful Vineyard application is a static Vite frontend application, and a Python FastAPI backend.

[Deployment Source](/infra/vengeful-vineyard/main.tf) | [Source Code](https://github.com/dotkom/vengeful-vineyard)

## Frontend Deployment

The frontend deployment makes use of [modules/aws-s3-public-bucket](/infra/modules/aws-s3-public-bucket/README.md) to
deploy the static assets to an Amazon S3 bucket. The bucket is configured to serve the static assets as a website.

DNS is managed with Route53.

The SSL certificate is managed with AWS Certificate Manager, which is pointed to the domain used for the CloudFront
distribution.

## Backend Deployment

The backend is packaged into a Docker image which is pushed to Amazon ECR. The image is pulled from AWS Lightsail and
run as a container service on Lightsail. It uses the
[modules/aws-lightsail-container-service](/infra/modules/aws-lightsail-container-service/README.md) module for
deployment.

DNS is managed with Route53.

The SSL certificate for the backend is managed through Lightsail.

## PostgreSQL Database

The PostgreSQL database used by the backend is a Neon database. It is deployed using the
[modules/neon-database](/infra/modules/neon-project/README.md) module.
