import type { FastifyInstance } from "fastify"

export function registerObservabilityProbeRoutes(server: FastifyInstance) {
  server.get("/health", (_, res) => {
    res.send({ status: "ok" })
  })
}
