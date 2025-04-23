import * as Sentry from "@sentry/node"
import { env } from "./env"

if (env.SENTRY_DSN !== undefined) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
  })
}
