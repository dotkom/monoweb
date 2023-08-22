import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

const variable = z.string().min(1)

export const createEnvironment = () =>
  createEnv({
    clientPrefix: "NEXT_PUBLIC_",
    server: {
      DASHBOARD_COGNITO_CLIENT_ID: variable,
      DASHBOARD_COGNITO_CLIENT_SECRET: variable,
      DASHBOARD_COGNITO_ISSUER: variable,

      WEB_COGNITO_CLIENT_ID: variable,
      WEB_COGNITO_CLIENT_SECRET: variable,
      WEB_COGNITO_ISSUER: variable,

      NODE_ENV: z.enum(["development", "test", "production"]),
      DATABASE_URL: variable,
      NEXTAUTH_SECRET: variable,
    },
    client: {},
    runtimeEnv: {
      DASHBOARD_COGNITO_CLIENT_ID: process.env.DASHBOARD_COGNITO_CLIENT_ID,
      DASHBOARD_COGNITO_CLIENT_SECRET: process.env.DASHBOARD_COGNITO_CLIENT_SECRET,
      DASHBOARD_COGNITO_ISSUER: process.env.DASHBOARD_COGNITO_ISSUER,

      WEB_COGNITO_CLIENT_ID: process.env.WEB_COGNITO_CLIENT_ID,
      WEB_COGNITO_CLIENT_SECRET: process.env.WEB_COGNITO_CLIENT_SECRET,
      WEB_COGNITO_ISSUER: process.env.WEB_COGNITO_ISSUER,

      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    },
  })

export const env = createEnvironment()

export type Environment = typeof env
