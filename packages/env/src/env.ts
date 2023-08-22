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
    },
    client: {},
    runtimeEnv: {
      DASHBOARD_COGNITO_CLIENT_ID: process.env.DASHBOARD_COGNITO_CLIENT_ID,
      DASHBOARD_COGNITO_CLIENT_SECRET: process.env.DASHBOARD_COGNITO_CLIENT_SECRET,
      DASHBOARD_COGNITO_ISSUER: process.env.DASHBOARD_COGNITO_ISSUER,
    },
  })

export const env = createEnvironment()

export type Environment = typeof env
