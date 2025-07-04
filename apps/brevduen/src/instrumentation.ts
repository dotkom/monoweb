import { getResource, startOpenTelemetry } from "@dotkomonline/logger"
import * as Sentry from "@sentry/node"
import { env } from "./env"

const resource = getResource("monoweb-brevduen")
startOpenTelemetry(resource)

if (env.SENTRY_DSN !== undefined) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    skipOpenTelemetrySetup: true,
  })
}
