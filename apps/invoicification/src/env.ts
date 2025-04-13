import { createEnvironment, variable } from "@dotkomonline/environment"

export const env = createEnvironment(
  {
    EMAIL_ENDPOINT: variable,
    EMAIL_TOKEN: variable,
    SENTRY_DSN: variable.optional(),

    NEXT_PUBLIC_SENTRY_DSN: variable.optional(),
  },
  {
    env: {
      ...process.env,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    },
    skipValidation: false,
  }
)
