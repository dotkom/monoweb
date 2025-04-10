import { createEnvironment, variable } from "@dotkomonline/environment"

export const env = createEnvironment(
  {
    EMAIL_TOKEN: variable,
    SENTRY_DSN: variable.optional(),
  },
  {
    env: process.env,
    skipValidation: process.env.DOCKER_BUILD === "1",
  }
)
