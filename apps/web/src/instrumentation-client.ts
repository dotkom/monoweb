import * as Sentry from "@sentry/nextjs"
import "core-js/stable"

if (process.env.NEXT_PUBLIC_SENTRY_DSN !== undefined) {
  console.info("Initializing Sentry for client-side Next.js...")
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // SENTRY_RELEASE and DOPPLER_ENVIRONMENT are embedded into the Dockerfile
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    environment: process.env.NEXT_PUBLIC_DOPPLER_ENVIRONMENT,
    tracesSampleRate: 1,
    sendDefaultPii: false,
    debug: false,
    skipOpenTelemetrySetup: true,
  })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
