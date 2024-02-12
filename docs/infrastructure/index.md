# Infrastructure Services

Dotkom uses a variety of services to keep the infrastructure for Monoweb and related applications running. This document
gives a high-level overview of the services involved and how they are used.

Every part of the Dotkom Monoweb infrastructure is deployed using Terraform. See the [Terraform websitge][tf-primer] for
a primer on what Terraform is and why it's beneficial.

Each of our Terraform-managed services are described in detail in their respective documents.

- Monoweb: [docs/infrastructure/monoweb.md](./monoweb.md)
- Vengeful Vineyard: [docs/infrastructure/vengeful-vineyard.md](./vengeful-vineyard.md)
- Report Interest Form: [docs/infrastructure/rif.md](./rif.md)
- Gateway Email: [docs/infrastructure/gateway-email.md](./gateway-email.md)
- Gradestats: [docs/infrastructure/gradestats.md](./gradestats.md)
- OnlineWeb4: [docs/infrastructure/onlineweb4.md](./onlineweb4.md)

## Amazon Web Services

Amazon Web Services is the primary cloud provider for both serverless and long-running applications. We also use AWS for
DNS management.

## Vercel

Web applications, more specifically things built with Next.js, are deployed using Vercel. Vercel is a hosting platform
for websites. It's serverless meaning we don't need to worry about scaling. We use Vercel because the preview
deployments are really useful for user interfaces.

## Doppler

Doppler is a secrets management service. We use it to store secrets like API keys and database credentials.

## Neon

Neon is a "serverless postgres" service. This is the primary database for Monoweb and related applications.

[tf-primer]: https://www.terraform.io/use-cases/infrastructure-as-code
