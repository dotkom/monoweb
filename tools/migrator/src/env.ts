import { createEnvironment, variable } from "@dotkomonline/environment"

export const env = createEnvironment({
  DATABASE_URL: variable,
  AWS_RDS_CERTIFICATE_AUTHORITY: variable.optional(),
})
