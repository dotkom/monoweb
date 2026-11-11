import { getLogger, getResource, startOpenTelemetry } from "@dotkomonline/logger"

const logger = getLogger("monoweb-rpc/instrumentation")
const resource = getResource("monoweb-rpc")
startOpenTelemetry(resource)
logger.info("OpenTelemetry registered")
