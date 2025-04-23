import { createEnvironment, variable } from "@dotkomonline/environment"

export const env = createEnvironment(
  {
    AUTH0_ISSUER: variable,
    AUTH0_AUDIENCES: variable,
    AUTH0_CLIENT_ID: variable,
    AUTH0_CLIENT_SECRET: variable,
    AUTH0_MGMT_TENANT: variable,
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
    // Sentry DSN should only be set in production
    SENTRY_DSN: variable.optional(),
  },
  {
    env: process.env,
    skipValidation: process.env.DOCKER_BUILD === "1",
  }
)
