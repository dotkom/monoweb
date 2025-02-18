import { createEnvironment, variable } from "@dotkomonline/environment"

export const env = createEnvironment({
  OAUTH_ISSUER: variable,
  OAUTH_AUDIENCES: variable,
  ALLOWED_ORIGINS: variable,
  AWS_REGION: variable,
  AWS_S3_BUCKET: variable,
  DATABASE_URL: variable,
  TRIKOM_STRIPE_PUBLIC_KEY: variable,
  TRIKOM_STRIPE_SECRET_KEY: variable,
  TRIKOM_STRIPE_WEBHOOK_SECRET: variable,
  FAGKOM_STRIPE_PUBLIC_KEY: variable,
  FAGKOM_STRIPE_SECRET_KEY: variable,
  FAGKOM_STRIPE_WEBHOOK_SECRET: variable,
  MANAGEMENT_OAUTH_CLIENT_ID: variable,
  MANAGEMENT_OAUTH_CLIENT_SECRET: variable,
  MANAGEMENT_TENANT_DOMAIN_ID: variable,
})
