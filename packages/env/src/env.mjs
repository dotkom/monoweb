import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const environmentVariableSchema = z.string().nonempty();

export const createEnvironment = () =>
  createEnv({
    clientPrefix: "NEXT_PUBLIC_",
    server: {
      DASHBOARD_COGNITO_CLIENT_ID: environmentVariableSchema,
      DASHBOARD_COGNITO_CLIENT_SECRET: environmentVariableSchema,
      DASHBOARD_COGNITO_ISSUER: environmentVariableSchema,

      WEB_COGNITO_CLIENT_ID: environmentVariableSchema,
      WEB_COGNITO_CLIENT_SECRET: environmentVariableSchema,
      WEB_COGNITO_ISSUER: environmentVariableSchema,

      NODE_ENV: z.enum(["development", "test", "production"]).optional(),
      VERCEL_URL: environmentVariableSchema.optional(),

      DATABASE_URL: environmentVariableSchema,
      NEXTAUTH_SECRET: environmentVariableSchema,

      TRIKOM_STRIPE_PUBLIC_KEY: environmentVariableSchema,
      TRIKOM_STRIPE_SECRET_KEY: environmentVariableSchema,
      TRIKOM_STRIPE_WEBHOOK_SECRET: environmentVariableSchema,

      FAGKOM_STRIPE_PUBLIC_KEY: environmentVariableSchema,
      FAGKOM_STRIPE_SECRET_KEY: environmentVariableSchema,
      FAGKOM_STRIPE_WEBHOOK_SECRET: environmentVariableSchema,
    },
    client: {
      NEXT_PUBLIC_NODE_ENV: environmentVariableSchema.optional(),
      NEXT_PUBLIC_VERCEL_URL: environmentVariableSchema.optional(),
    },
    runtimeEnv: {
      DASHBOARD_COGNITO_CLIENT_ID: process.env.DASHBOARD_COGNITO_CLIENT_ID,
      DASHBOARD_COGNITO_CLIENT_SECRET: process.env.DASHBOARD_COGNITO_CLIENT_SECRET,
      DASHBOARD_COGNITO_ISSUER: process.env.DASHBOARD_COGNITO_ISSUER,

      WEB_COGNITO_CLIENT_ID: process.env.WEB_COGNITO_CLIENT_ID,
      WEB_COGNITO_CLIENT_SECRET: process.env.WEB_COGNITO_CLIENT_SECRET,
      WEB_COGNITO_ISSUER: process.env.WEB_COGNITO_ISSUER,

      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,

      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      NEXT_PUBLIC_VERCEL_URL: process.env.VERCEL_URL,

      TRIKOM_STRIPE_PUBLIC_KEY: process.env.TRIKOM_STRIPE_PUBLIC_KEY,
      TRIKOM_STRIPE_SECRET_KEY: process.env.TRIKOM_STRIPE_SECRET_KEY,
      TRIKOM_STRIPE_WEBHOOK_SECRET: process.env.TRIKOM_STRIPE_WEBHOOK_SECRET,

      FAGKOM_STRIPE_PUBLIC_KEY: process.env.FAGKOM_STRIPE_PUBLIC_KEY,
      FAGKOM_STRIPE_SECRET_KEY: process.env.FAGKOM_STRIPE_SECRET_KEY,
      FAGKOM_STRIPE_WEBHOOK_SECRET: process.env.FAGKOM_STRIPE_WEBHOOK_SECRET,
    },
  });

export const env = createEnvironment();
