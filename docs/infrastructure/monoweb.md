# Monoweb Deployment

Monoweb is the primary website for the new OnlineWeb. It's a Next.js application with a dashboard for managing the
content. The application is deployed using Vercel.

It uses a PostgreSQL database as its primary data store.

[Deployment Source](/infra/web/web.tf) | [Source Code](/apps/web) | [Dashboard Source Code](/apps/dashboard)

## Web Application Deployment

The application is deployed using Vercel. The deployment is triggered by a push to the `main` branch of the repository.
The infrastructure is provisioned through [modules/vercel-application](/infra/modules/vercel-application/README.md).

This serverless application also hosts the backend, available under `/api/trpc/`.

DNS is managed with Route53.

## Dashboard Application Deployment

The dashboard is deployed using Vercel. The deployment is triggered by a push to the `main` branch of the repository.
The infrastructure is provisioned through [modules/vercel-application](/infra/modules/vercel-application/README.md).

## PostgreSQL Database

The database is a Neon database. It is deployed using the [modules/neon-database](/infra/modules/neon-project/README.md) module.
