import { createEnvironment, variable } from "@dotkomonline/environment"

export const env = createEnvironment(
  {
    OAUTH_CLIENT_ID: variable,
    OAUTH_CLIENT_SECRET: variable,
    OAUTH_ISSUER: variable,
    AUTH_SECRET: variable,
    RPC_HOST: variable,
    SENTRY_DSN: variable.optional(),

    NEXT_PUBLIC_ORIGIN: variable,
    NEXT_PUBLIC_RPC_HOST: variable,
    NEXT_PUBLIC_SENTRY_DSN: variable.optional(),
  },
  {
    env: {
      ...process.env,
      NEXT_PUBLIC_ORIGIN: process.env.NEXT_PUBLIC_ORIGIN,
      NEXT_PUBLIC_RPC_HOST: process.env.NEXT_PUBLIC_RPC_HOST,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    },
    // Dashboard should also validate env at build time
    skipValidation: false,
  }
)
