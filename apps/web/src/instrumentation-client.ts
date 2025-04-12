import { env } from "@/env"
import * as Sentry from "@sentry/nextjs"

if (env.NEXT_PUBLIC_SENTRY_DSN !== undefined) {
  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    debug: false,
  })
}
