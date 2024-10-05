import { createEnvironment, variable } from "@dotkomonline/environment"

export const env = createEnvironment({
  OAUTH_CLIENT_ID: variable,
  OAUTH_CLIENT_SECRET: variable,
  OAUTH_ISSUER: variable,
  NEXTAUTH_SECRET: variable,
  NEXT_PUBLIC_ORIGIN: variable.default("http://localhost:3002"),
  DATABASE_URL: variable,
  RPC_HOST: variable,
})
