import { createEnvironment, variable } from "@dotkomonline/environment"

export const env = createEnvironment(
  {
    OAUTH_CLIENT_ID: variable,
    OAUTH_CLIENT_SECRET: variable,
    OAUTH_ISSUER: variable,
    AUTH_SECRET: variable,
    // Behind a proxy (e.g AWS ALB) the Host header will be the proxy's host, so
    // we tell AuthJs to trust the X-Forwarded-Host header instead.
    AUTH_TRUST_HOST: variable.optional(),
    AUTH_URL: variable.optional(),
    NEXT_PUBLIC_ORIGIN: variable.default("http://localhost:3000"),
    RPC_HOST: variable,
    SIGNING_KEY: variable,
  },
  {
    ...process.env,
    NEXT_PUBLIC_ORIGIN: process.env.NEXT_PUBLIC_ORIGIN,
  }
)
