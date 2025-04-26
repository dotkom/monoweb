import { createEnvironment, variable } from "@dotkomonline/environment"

export const env = createEnvironment(
  {
    AUTH0_CLIENT_ID: variable,
    AUTH0_CLIENT_SECRET: variable,
    AUTH0_ISSUER: variable,
    AUTH0_AUDIENCES: variable,
    AUTH_SECRET: variable,
    RPC_HOST: variable,
    SIGNING_KEY: variable,
    NEXT_PUBLIC_ORIGIN: variable,
    NEXT_PUBLIC_RPC_HOST: variable,
    NEXT_PUBLIC_DASHBOARD_URL: variable,
    NEXT_PUBLIC_HOME_URL: variable.default("/"),
  },
  {
    env: {
      ...process.env,
      NEXT_PUBLIC_ORIGIN: process.env.NEXT_PUBLIC_ORIGIN,
      NEXT_PUBLIC_DASHBOARD_URL: process.env.NEXT_PUBLIC_DASHBOARD_URL,
      NEXT_PUBLIC_RPC_HOST: process.env.NEXT_PUBLIC_RPC_HOST,
      NEXT_PUBLIC_HOME_URL: process.env.NEXT_PUBLIC_HOME_URL,
    },
    // Web should also validate env at build time
    skipValidation: false,
  }
)
