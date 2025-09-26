import { config, defineConfiguration } from "@dotkomonline/environment"
import z from "zod"

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

  googleWorkspace: {
    serviceAccount: config(process.env.WORKSPACE_SERVICE_ACCOUNT, null),
    userAccountEmail: config(process.env.WORKSPACE_USER_ACCOUNT_EMAIL, null),
    domain: config(process.env.WORKSPACE_DOMAIN, "online.ntnu.no"),
  },
  email: {
    awsSqsQueueUrl: config(process.env.EMAIL_AWS_SQS_QUEUE_URL, null),
    awsSqsWorkerInterval: config(process.env.EMAIL_AWS_SQS_WORKER_INTERVAL, 1000, z.coerce.number().int()),
    awsSesRegion: config(process.env.EMAIL_AWS_SES_REGION, "eu-north-1"),
  },
  tasks: {
    workerInterval: config(process.env.TASKS_WORKER_INTERVAL, 1000, z.coerce.number().int()),
  },
})

/** Type where config.googleWorkspace has no nullable keys */
export type ConfigurationWithGoogleWorkspace = Configuration & {
  googleWorkspace: {
    [K in keyof Configuration["googleWorkspace"]]: Exclude<Configuration["googleWorkspace"][K], null>
  }
}

export function isGoogleWorkspaceFeatureEnabled(
  configuration: Configuration
): configuration is ConfigurationWithGoogleWorkspace {
  return (
    configuration.googleWorkspace.serviceAccount !== null && configuration.googleWorkspace.userAccountEmail !== null
  )
}

/** Type where config.email has no nullable keys */
export type ConfigurationWithAmazonSesEmail = Configuration & {
  email: {
    [K in keyof Configuration["email"]]: Exclude<Configuration["email"][K], null>
  }
}

/**
 * Is the service configured to use AWS SES for email delivery?
 *
 * NOTE: The Email service requires both AWS SES and AWS SQS configuration, as the emails to send are read off an SQS
 * queue in order to respect service rate limits.
 */
export function isAmazonSesEmailFeatureEnabled(
  configuration: Configuration
): configuration is ConfigurationWithAmazonSesEmail {
  return configuration.email.awsSqsQueueUrl !== null
}
