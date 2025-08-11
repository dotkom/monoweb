import { logs } from "@opentelemetry/api-logs"
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-proto"
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto"
import { WinstonInstrumentation } from "@opentelemetry/instrumentation-winston"
import { awsEcsDetector } from "@opentelemetry/resource-detector-aws"
import { containerDetector } from "@opentelemetry/resource-detector-container"
import { detectResources, resourceFromAttributes } from "@opentelemetry/resources"
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs"
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics"
import { NodeSDK } from "@opentelemetry/sdk-node"
import { RandomIdGenerator } from "@opentelemetry/sdk-trace-node"
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions"
import * as Sentry from "@sentry/nextjs"

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    console.warn("Instrumentation is only supported in Node.js runtime.")
    return
  }

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "monoweb-brevduen",
    [ATTR_SERVICE_VERSION]: "0.1.0",
  }).merge(
    detectResources({
      detectors: [containerDetector, awsEcsDetector],
    })
  )
  const logRecordProcessor = new BatchLogRecordProcessor(new OTLPLogExporter())
  const loggerProvider = new LoggerProvider({ resource, processors: [logRecordProcessor] })
  const telemetry = new NodeSDK({
    resource,
    metricReader: new PeriodicExportingMetricReader({ exporter: new OTLPMetricExporter() }),
    traceExporter: new OTLPTraceExporter(),
    logRecordProcessors: [logRecordProcessor],
    idGenerator: new RandomIdGenerator(),
    instrumentations: [new WinstonInstrumentation({ enabled: true })],
  })
  telemetry.start()
  logs.setGlobalLoggerProvider(loggerProvider)

  const { getLogger } = await import("@dotkomonline/logger")
  const logger = getLogger("opentelemetry")

  process.on("SIGTERM", () =>
    telemetry
      .shutdown()
      .then(() => logger.error("OpenTelemetry terminated"))
      .catch((e) => logger.error("OpenTelemetry failed to terminate: %o", e))
  )
  process.on("beforeExit", () =>
    telemetry
      .shutdown()
      .then(() => logger.error("OpenTelemetry terminated"))
      .catch((e) => logger.error("OpenTelemetry failed to terminate: %o", e))
  )

  logger.info("Using opentelemetry otlp endpoint: %s", process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "localhost:4317")
  logger.info("OpenTelemetry instrumentation installed (service-name=%s)", resource.attributes[ATTR_SERVICE_NAME])

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
