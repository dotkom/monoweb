import { createEnvironment, variable } from "@dotkomonline/environment"

export const env = createEnvironment(
  {
    OAUTH_CLIENT_ID: variable,
    OAUTH_CLIENT_SECRET: variable,
    OAUTH_ISSUER: variable,
    AUTH_SECRET: variable,
    NEXT_PUBLIC_ORIGIN: variable.default("http://localhost:3002"),
    RPC_HOST: variable,
  },
  {
    ...process.env,
    NEXT_PUBLIC_ORIGIN: process.env.NEXT_PUBLIC_ORIGIN,
  }
)
