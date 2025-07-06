import * as Sentry from "@sentry/nextjs"

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    console.warn("Instrumentation is only supported in Node.js runtime.")
    return
  }
  const { getLogger, getResource, startOpenTelemetry } = await import("@dotkomonline/logger")
  const logger = getLogger("monoweb-dashboard/instrumentation")
  const resource = getResource("monoweb-dashboard")
  startOpenTelemetry(resource)

  if (process.env.SENTRY_DSN !== undefined) {
    logger.info("Initializing Sentry for server-side Next.js...")
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      // SENTRY_RELEASE and DOPPLER_ENVIRONMENT are embedded into the Dockerfile
      release: process.env.SENTRY_RELEASE,
      environment: process.env.DOPPLER_ENVIRONMENT,
      tracesSampleRate: 1,
      sendDefaultPii: false,
      debug: false,
      skipOpenTelemetrySetup: true,
    })
  }
}

export const onRequestError = Sentry.captureRequestError
