import { getLogger } from "@dotkomonline/logger"
import fastifyCors from "@fastify/cors"
import { type FastifyTRPCPluginOptions, fastifyTRPCPlugin } from "@trpc/server/adapters/fastify"
import fastify from "fastify"
import rawBody from "fastify-raw-body"
import { type AppRouter, appRouter } from "../app-router"
import { createConfiguration } from "../configuration"
import { registerObservabilityProbeRoutes } from "../http-routes/observability-probe"
import { createServiceLayer, createThirdPartyClients } from "../modules/core"
import { createTrpcContext } from "../trpc"

const logger = getLogger("grades-backend")

const configuration = createConfiguration()
const allowedOrigins = configuration.ALLOWED_ORIGINS.split(",")

const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies)

export async function createFastifyContext() {
  return createTrpcContext(serviceLayer)
}

const server = fastify({
  routerOptions: {
    maxParamLength: 5000,
  },
})
await server.register(rawBody, {
  field: "rawBody",
  global: false,
  encoding: "utf8",
  runFirst: true,
  routes: [],
  jsonContentTypes: [],
})
server.setErrorHandler((error) => {
  logger.error(error)
  console.error(error)
})
server.register(fastifyCors, {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "X-Requested-With", "X-CSRF-Token", "Origin"],
  credentials: true,
})

server.register(fastifyTRPCPlugin, {
  prefix: "/api/trpc",
  trpcOptions: {
    router: appRouter,
    createContext: createFastifyContext,
  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
})

registerObservabilityProbeRoutes(server)

await server.listen({ port: 5555, host: "0.0.0.0" })

logger.info("Started RPC server on http://0.0.0.0:5555")
