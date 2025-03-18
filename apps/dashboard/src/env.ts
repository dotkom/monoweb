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
    NEXT_PUBLIC_ORIGIN: variable.default("http://localhost:3002"),
    RPC_HOST: variable,
    // These should only be set in production
    SENTRY_DSN: variable.optional(),
    OTEL_EXPORTER_OTLP_PROTOCOL: variable.optional(),
    OTEL_EXPORTER_OTLP_ENDPOINT: variable.optional(),
    OTEL_EXPORTER_OTLP_HEADERS: variable.optional(),
  },
  {
    ...process.env,
    NEXT_PUBLIC_ORIGIN: process.env.NEXT_PUBLIC_ORIGIN,
  }
)
