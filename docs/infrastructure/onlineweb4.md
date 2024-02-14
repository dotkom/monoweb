# OnlineWeb 4

OnlineWeb4 is the fourth iteration of OW, and it's a fairly old Django application. It also has a more modern web
frontend named onlineweb-frontend. The entire config is managed outside of this terraform monorepo.

Most of the terraform configuration that belongs to this application can be found in the private `terraform-monorepo`
repository under the dotkom org.

[Server Source Code](https://github.com/dotkom/onlineweb4) | [Client Source Code](https://github.com/dotkom/onlineweb-frontend)

## Server Deployment

This is managed automatically by a pipeline in the onlineweb4 repository. The deployment is triggered by pushing a new
git tag to the repository.

The deployment itself is an AWS Lambda function packaged with Zappa.

Secrets used by the application are pulled from a deployed HashiCorp Vault instance.

## Frontend Deployment

The frontend is deployed using Vercel. The deployment is triggered by a push to the `main` branch of the repository.

## PostgreSQL Database

This is the main-db database found on RDS.
