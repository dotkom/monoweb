import { logs } from "@opentelemetry/api-logs"
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-proto"
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto"
import { awsEcsDetector } from "@opentelemetry/resource-detector-aws"
import { containerDetector } from "@opentelemetry/resource-detector-container"
import { type Resource, detectResources, resourceFromAttributes } from "@opentelemetry/resources"
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs"
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics"
import { NodeSDK } from "@opentelemetry/sdk-node"
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions"
import { OpenTelemetryTransportV3 } from "@opentelemetry/winston-transport"
import { type LoggerIdentifier, getLoggerWithTransports } from "./browser"
export type { Logger } from "winston"

export function getResource(serviceName: string, version = "0.1.0"): Resource {
  return resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: version,
  }).merge(
    detectResources({
      detectors: [containerDetector, awsEcsDetector],
    })
  )
}

/**
 * OpenTelemetry instrumentation for Monoweb.
 *
 * NOTE: The OpenTelemetry exporters are only available for Node at the moment, and as such this should never be used
 * in the browser.
 */
export function startOpenTelemetry(resource: Resource) {
  const logRecordProcessor = new BatchLogRecordProcessor(new OTLPLogExporter())
  const loggerProvider = new LoggerProvider({ resource, processors: [logRecordProcessor] })
  const telemetry = new NodeSDK({
    resource,
    metricReader: new PeriodicExportingMetricReader({ exporter: new OTLPMetricExporter() }),
    traceExporter: new OTLPTraceExporter(),
    logRecordProcessors: [logRecordProcessor],
  })
  telemetry.start()
  logs.setGlobalLoggerProvider(loggerProvider)
  const logger = getLogger("opentelemetry")

  process.on("SIGTERM", () =>
    telemetry
      .shutdown()
      .then(() => logger.error("opentelemetry terminated"))
      .catch((e) => logger.error("opentelemetry failed to terminate: %o", e))
  )
  process.on("beforeExit", () =>
    telemetry
      .shutdown()
      .then(() => logger.error("opentelemetry terminated"))
      .catch((e) => logger.error("opentelemetry failed to terminate: %o", e))
  )

  if ("OTEL_EXPORTER_OTLP_ENDPOINT" in process.env) {
    logger.info("using opentelemetry otlp endpoint: %s", process.env.OTEL_EXPORTER_OTLP_ENDPOINT)
  }
  logger.info("opentelemetry instrumentation installed (service-name=%s)", resource.attributes[ATTR_SERVICE_NAME])
}

export function getLogger(identifier: LoggerIdentifier) {
  return getLoggerWithTransports(identifier, [new OpenTelemetryTransportV3()])
}
