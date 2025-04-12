import * as Sentry from "@sentry/nextjs"
import { env } from "./env"

if (env.NEXT_PUBLIC_SENTRY_DSN !== undefined) {
  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    environment: env.NEXT_PUBLIC_DOPPLER_ENVIRONMENT,
    debug: false,
  })
}
