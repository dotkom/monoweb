import { getLogger, getResource, startOpenTelemetry } from "@dotkomonline/logger"
import * as Sentry from "@sentry/node"

const logger = getLogger("monoweb-rpc/instrumentation")
const resource = getResource("monoweb-rpc")
startOpenTelemetry(resource)

if (process.env.SENTRY_DSN !== undefined) {
  logger.info("Initializing Sentry...")
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    // SENTRY_RELEASE and DOPPLER_ENVIRONMENT are embedded into the Dockerfile
    release: process.env.SENTRY_RELEASE,
    environment: process.env.DOPPLER_ENVIRONMENT,
    tracesSampleRate: 1,
    sendDefaultPii: false,
    debug: false,
    skipOpenTelemetrySetup: true,
    defaultIntegrations: false,
  })
}
