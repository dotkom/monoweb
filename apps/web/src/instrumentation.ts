import * as Sentry from "@sentry/nextjs"
import { env } from "./env"

export async function register() {
  // The regular OTEL sdk does not work for edge runtime
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation.node")
  }
  // Enable Sentry if a DSN is available
  if (env.SENTRY_DSN !== undefined) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      skipOpenTelemetrySetup: true,
    })
  }
}
