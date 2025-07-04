import { getResource, startOpenTelemetry } from "@dotkomonline/logger"

export function register() {
  const resource = getResource("monoweb-dashboard")
  startOpenTelemetry(resource)
}
