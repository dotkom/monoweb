import { createEnvironment, variable } from "@dotkomonline/environment"

export const env = createEnvironment(
  {
    EMAIL_ENDPOINT: variable,
    EMAIL_TOKEN: variable,
    SERVICE_ACCOUNT: variable,
    SPREADSHEET_ID: variable,
  },
  {
    env: process.env,
    skipValidation: process.env.DOCKER_BUILD === "1",
  }
)
