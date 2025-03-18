import { logs } from "@opentelemetry/api-logs"
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-proto"
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto"
import { WinstonInstrumentation } from "@opentelemetry/instrumentation-winston"
import type { Resource } from "@opentelemetry/resources"
import { ConsoleLogRecordExporter, LoggerProvider, SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs"
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics"
import { NodeSDK } from "@opentelemetry/sdk-node"
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node"
import { getLogger } from "./index"

export interface OpenTelemetryOptions {
  otlp?: boolean
  resource: Resource
}

export function registerOpenTelemetry(opts: OpenTelemetryOptions) {
  // Enable shutdown hooks by default
  const logRecordProcessor = new SimpleLogRecordProcessor(
    opts.otlp ? new OTLPLogExporter() : new ConsoleLogRecordExporter()
  )
  const loggerProvider = new LoggerProvider({
    resource: opts.resource,
  })
  loggerProvider.addLogRecordProcessor(logRecordProcessor)

  const otel = new NodeSDK({
    resource: opts.resource,
    metricReader: new PeriodicExportingMetricReader({
      exporter: opts.otlp ? new OTLPMetricExporter() : new ConsoleMetricExporter(),
      exportIntervalMillis: 60000,
    }),
    logRecordProcessors: [logRecordProcessor],
    traceExporter: opts.otlp ? new OTLPTraceExporter() : new ConsoleSpanExporter(),
    instrumentations: [new WinstonInstrumentation()],
  })
  otel.start()
  const logger = getLogger("otel")

  logs.setGlobalLoggerProvider(loggerProvider)
  process.on("SIGTERM", () =>
    otel
      .shutdown()
      .then(() => logger.error("opentelemetry terminated"))
      .catch((e) => logger.error("opentelemetry failed to terminate: %o", e))
  )
  process.on("beforeExit", () =>
    otel
      .shutdown()
      .then(() => logger.error("opentelemetry terminated"))
      .catch((e) => logger.error("opentelemetry failed to terminate: %o", e))
  )

  // If the OTLP exporter has an endpoint configured, log it for debugging sake
  if ("OTEL_EXPORTER_OTLP_ENDPOINT" in process.env && opts.otlp) {
    logger.info("using opentelemetry otlp endpoint: %s", process.env.OTEL_EXPORTER_OTLP_ENDPOINT)
  }
  logger.info("opentelemetry instrumentation installed")
}
