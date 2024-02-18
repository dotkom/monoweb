# Gradestats Deployment

Gradestats is a legacy project built several years ago. It consists of a Python Django application, a Next.js frontend,
and a PostgreSQL database.

[Deployment Source](/infra/grades-lightsail/main.tf) | [Server Source Code](https://github.com/dotkom/gradestats) | [Client Source Code](https://github.com/dotkom/gradestats-app)

## Frontend Deployment

The frontend is built into a Docker image and pushed to Amazon ECR. The image is pulled from AWS Lightsail and run as a
container service on Lightsail. It uses the
[modules/aws-lightsail-container-service](/infra/modules/aws-lightsail-container-service/README.md) module for
deployment.

DNS is managed with Route53.

The SSL certificate for the frontend is managed through Lightsail.

## Backend Deployment

The backend is a also built into a Docker image, and follows the same deployment process as the frontend.

## PostgreSQL Database

The Grades database is not managed by our Terraform config, and is a legacy PostgreSQL database that lives inside the
OnlineWeb4 RDS instance.
