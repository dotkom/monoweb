export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getLogger, getResource, startOpenTelemetry } = await import("@dotkomonline/logger")
    const logger = getLogger("monoweb-web/instrumentation")
    const resource = getResource("monoweb-web")
    startOpenTelemetry(resource)
    logger.info("OpenTelemetry registered for server-side Next.js")
  }
}

export async function onRequestError(error: Error): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    console.error(error)

    return
  }

  const { getLogger } = await import("@dotkomonline/logger")
  getLogger("monoweb-web/instrumentation").error("Unhandled Next.js request error: %o", error)
}
