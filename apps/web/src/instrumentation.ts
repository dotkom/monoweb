import { env } from "@/env"
import * as Sentry from "@sentry/nextjs"

export async function register() {
  if (env.SENTRY_DSN !== undefined) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
    })
  }
}

export const onRequestError = Sentry.captureRequestError
