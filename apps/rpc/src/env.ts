import { config, defineConfiguration } from "@dotkomonline/environment"

export const env = defineConfiguration({
  AUTH0_ISSUER: config(process.env.AUTH0_ISSUER),
  AUTH0_AUDIENCES: config(process.env.AUTH0_AUDIENCES),
  AUTH0_CLIENT_ID: config(process.env.AUTH0_CLIENT_ID),
  AUTH0_CLIENT_SECRET: config(process.env.AUTH0_CLIENT_SECRET),
  AUTH0_MGMT_TENANT: config(process.env.AUTH0_MGMT_TENANT),

  ALLOWED_ORIGINS: config(process.env.ALLOWED_ORIGINS, {
    prd: "https://online.ntnu.no",
    stg: "https://staging.online.ntnu.no",
    dev: "http://localhost:3000",
  }),
  ADMIN_USERS: config(process.env.ADMIN_USERS),

  AWS_REGION: config(process.env.AWS_REGION, "eu-north-1"),
  AWS_S3_BUCKET: config(process.env.AWS_S3_BUCKET),
  DATABASE_URL: config(process.env.DATABASE_URL),

  TRIKOM_STRIPE_PUBLIC_KEY: config(process.env.TRIKOM_STRIPE_PUBLIC_KEY),
  TRIKOM_STRIPE_SECRET_KEY: config(process.env.TRIKOM_STRIPE_SECRET_KEY),
  TRIKOM_STRIPE_WEBHOOK_SECRET: config(process.env.TRIKOM_STRIPE_WEBHOOK_SECRET),

  FAGKOM_STRIPE_PUBLIC_KEY: config(process.env.FAGKOM_STRIPE_PUBLIC_KEY),
  FAGKOM_STRIPE_SECRET_KEY: config(process.env.FAGKOM_STRIPE_SECRET_KEY),
  FAGKOM_STRIPE_WEBHOOK_SECRET: config(process.env.FAGKOM_STRIPE_WEBHOOK_SECRET),
})
