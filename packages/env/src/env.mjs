import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

const environmentVariableSchema = z.string().nonempty()

export const createEnvironment = (skipValidation = false) =>
  createEnv({
    clientPrefix: "NEXT_PUBLIC_",
    server: {
      DASHBOARD_AUTH0_CLIENT_ID: environmentVariableSchema,
      DASHBOARD_AUTH0_CLIENT_SECRET: environmentVariableSchema,
      DASHBOARD_AUTH0_ISSUER: environmentVariableSchema,

      WEB_AUTH0_CLIENT_ID: environmentVariableSchema,
      WEB_AUTH0_CLIENT_SECRET: environmentVariableSchema,
      WEB_AUTH0_ISSUER: environmentVariableSchema,

      NODE_ENV: z.enum(["development", "test", "production"]).optional(),
      VERCEL_URL: environmentVariableSchema.optional(),
      DATABASE_URL: environmentVariableSchema,
      NEXTAUTH_SECRET: environmentVariableSchema,
      AWS_REGION: environmentVariableSchema,

      TRIKOM_STRIPE_PUBLIC_KEY: environmentVariableSchema,
      TRIKOM_STRIPE_SECRET_KEY: environmentVariableSchema,
      TRIKOM_STRIPE_WEBHOOK_SECRET: environmentVariableSchema,

      FAGKOM_STRIPE_PUBLIC_KEY: environmentVariableSchema,
      FAGKOM_STRIPE_SECRET_KEY: environmentVariableSchema,
      FAGKOM_STRIPE_WEBHOOK_SECRET: environmentVariableSchema,

      S3_BUCKET_MONOWEB: environmentVariableSchema,
    },
    client: {
      NEXT_PUBLIC_NODE_ENV: environmentVariableSchema.optional(),
      NEXT_PUBLIC_VERCEL_URL: environmentVariableSchema.optional(),
    },
    runtimeEnv: {
      DASHBOARD_AUTH0_CLIENT_ID: process.env.DASHBOARD_AUTH0_CLIENT_ID,
      DASHBOARD_AUTH0_CLIENT_SECRET: process.env.DASHBOARD_AUTH0_CLIENT_SECRET,
      DASHBOARD_AUTH0_ISSUER: process.env.DASHBOARD_AUTH0_ISSUER,

      WEB_AUTH0_CLIENT_ID: process.env.WEB_AUTH0_CLIENT_ID,
      WEB_AUTH0_CLIENT_SECRET: process.env.WEB_AUTH0_CLIENT_SECRET,
      WEB_AUTH0_ISSUER: process.env.WEB_AUTH0_ISSUER,

      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,

      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      NEXT_PUBLIC_VERCEL_URL: process.env.VERCEL_URL,
      AWS_REGION: process.env.AWS_REGION,

      TRIKOM_STRIPE_PUBLIC_KEY: process.env.TRIKOM_STRIPE_PUBLIC_KEY,
      TRIKOM_STRIPE_SECRET_KEY: process.env.TRIKOM_STRIPE_SECRET_KEY,
      TRIKOM_STRIPE_WEBHOOK_SECRET: process.env.TRIKOM_STRIPE_WEBHOOK_SECRET,

      FAGKOM_STRIPE_PUBLIC_KEY: process.env.FAGKOM_STRIPE_PUBLIC_KEY,
      FAGKOM_STRIPE_SECRET_KEY: process.env.FAGKOM_STRIPE_SECRET_KEY,
      FAGKOM_STRIPE_WEBHOOK_SECRET: process.env.FAGKOM_STRIPE_WEBHOOK_SECRET,

      S3_BUCKET_MONOWEB: process.env.S3_BUCKET_MONOWEB,
    },
    skipValidation,
  })

export const env = createEnvironment()
