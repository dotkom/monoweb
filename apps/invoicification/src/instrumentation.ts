import * as Sentry from "@sentry/nextjs"
import { env } from "./env"

export async function register() {
  if (env.SENTRY_DSN !== undefined) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.DOPPLER_ENVIRONMENT,
    })
  }
}

export const onRequestError = Sentry.captureRequestError
