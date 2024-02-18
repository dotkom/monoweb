# Gateway Email Deployment

The Gateway Email service is a AWS Lambda handler built in TypeScript that dispatches email through AWS SES. The emails
themselves are designed using https://react.email, and is made available through templates.

[Deployment Source](/infra/web/emails.tf) | [Source Code](/apps/gateway-email/src/lambda.ts)

## Email Dispatcher

The email dispatcher is built into a Docker image using the official AWS Lambda for Node.js base image. The image is
pushed to Amazon ECR, and is deployed using the
[modules/aws-docker-lambda](/infra/modules/aws-docker-lambda/README.md) module. This provisions a public AWS API Gateway
endpoint that can be used to send emails.

Note that the endpoint is protected by an API token which can be found in Doppler.

## Email Templates

The email templates are built and stored inside [/packages/emails/src/emails/](/packages/emails/src/emails), and are
compiled when building the dispatcher.
