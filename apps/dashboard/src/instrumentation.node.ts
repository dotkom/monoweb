import { registerOpenTelemetry } from "@dotkomonline/logger"
import { resourceFromAttributes } from "@opentelemetry/resources"
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions"

registerOpenTelemetry({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "monoweb-dashboard",
  }),
  otlp: process.env.OTEL_EXPORTER_OTLP_ENDPOINT !== undefined,
})
