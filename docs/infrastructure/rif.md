# Report Interest Form Deployment

The Report Interest Form is a simple Next.js application with an API route to submit the form. The API route makes use
of the [gateway-email](./gateway-email.md) service to send an email to notify both the submitter and Bedkom.

[Source Code](/apps/rif)

## Application Deployment

The application is deployed using Vercel. The deployment is triggered by a push to the `main` branch of the repository.

The source for this deployment is inside the core infrastructure project. [Source](/infra/core/vercel.tf)

The DNS records are managed with Route53.
