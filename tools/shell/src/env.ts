import { createEnvironment, variable } from "@dotkomonline/environment"

export const env = createEnvironment({
  DATABASE_URL: variable,
  AWS_REGION: variable,
  MANAGEMENT_OAUTH_CLIENT_ID: variable,
  MANAGEMENT_OAUTH_CLIENT_SECRET: variable,
  OAUTH_ISSUER: variable,
})
