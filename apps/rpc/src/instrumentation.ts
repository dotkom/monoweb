import { registerOpenTelemetry } from "@dotkomonline/logger"
import { resourceFromAttributes } from "@opentelemetry/resources"
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions"
import * as Sentry from "@sentry/node"
import { env } from "./env"

registerOpenTelemetry({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "monoweb-rpc",
  }),
  otlp: env.OTEL_EXPORTER_OTLP_ENDPOINT !== undefined,
})

if (env.SENTRY_DSN !== undefined) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    skipOpenTelemetrySetup: true,
  })
}
