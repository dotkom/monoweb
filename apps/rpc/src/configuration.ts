import { config, defineConfiguration } from "@dotkomonline/environment"

export type Configuration = typeof configuration
export const configuration = defineConfiguration({
  AUTH0_ISSUER: config(process.env.AUTH0_ISSUER),
  AUTH0_AUDIENCES: config(process.env.AUTH0_AUDIENCES),
  AUTH0_CLIENT_ID: config(process.env.AUTH0_CLIENT_ID),
  AUTH0_CLIENT_SECRET: config(process.env.AUTH0_CLIENT_SECRET),
  AUTH0_MGMT_TENANT: config(process.env.AUTH0_MGMT_TENANT),

  WEB_PUBLIC_ORIGIN: config(process.env.WEB_PUBLIC_ORIGIN),
  ALLOWED_ORIGINS: config(process.env.ALLOWED_ORIGINS, {
    prd: "https://online.ntnu.no",
    stg: "https://staging.online.ntnu.no",
    dev: "http://localhost:3000",
  }),
  STRIPE_WEBHOOK_IDENTIFIER: config(process.env.STRIPE_WEBHOOK_IDENTIFIER, {
    prd: "prd",
    stg: "stg",
    dev: "dev",
  }),
  HOST: config(process.env.HOST, "http://localhost:4444"),

  AWS_REGION: config(process.env.AWS_REGION, "eu-north-1"),
  /**
   * AWS S3 bucket corresponding to the OnlineWeb CDN.
   *
   * Typically, this is something like `cdn.online.ntnu.no`.
   *
   * NOTE: Users of this bucket MUST prefix their keys accordingly as to not pollute the bucket root.
   */
  AWS_S3_BUCKET: config(process.env.AWS_S3_BUCKET),
  DATABASE_URL: config(process.env.DATABASE_URL),

  STRIPE_SECRET_KEY: config(process.env.STRIPE_SECRET_KEY),

  WORKSPACE_SERVICE_ACCOUNT: config(process.env.WORKSPACE_SERVICE_ACCOUNT, null),
  WORKSPACE_USER_ACCOUNT_EMAIL: config(process.env.WORKSPACE_USER_ACCOUNT_EMAIL, null),
  WORKSPACE_DOMAIN: config(process.env.WORKSPACE_DOMAIN, "online.ntnu.no"),
  WORKSPACE_ENABLED: config(process.env.WORKSPACE_ENABLED, "false") === "true",

  AWS_SQS_QUEUE_EMAIL_DELIVERY: config(process.env.AWS_SQS_QUEUE_EMAIL_DELIVERY, null),
})
