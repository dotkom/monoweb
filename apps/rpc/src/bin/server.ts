import "../instrumentation"

import { getLogger } from "@dotkomonline/logger"
import { JwtService } from "@dotkomonline/oauth2/jwt"
import fastifyCors from "@fastify/cors"
import { captureException } from "@sentry/node"
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify"
import { type FastifyTRPCPluginOptions, fastifyTRPCPlugin } from "@trpc/server/adapters/fastify"
import fastify from "fastify"
import rawBody from "fastify-raw-body"
import { type AppRouter, appRouter } from "../app-router"
import { identifyCallerIAMIdentity } from "../aws"
import { createConfiguration } from "../configuration"
import { registerObservabilityProbeRoutes } from "../http-routes/observability-probe"
import { registerStripeWebhookRoutes } from "../http-routes/stripe"
import { createServiceLayer, createThirdPartyClients } from "../modules/core"
import { createTrpcContext } from "../trpc"

const logger = getLogger("rpc")
const configuration = createConfiguration()
const allowedOrigins = configuration.ALLOWED_ORIGINS.split(",")
const oauthAudiences = configuration.AUTH0_AUDIENCES.split(",")
const jwtService = new JwtService(configuration.AUTH0_ISSUER, oauthAudiences)

const controller = new AbortController()
const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration)

// Start background workers of different kinds. These are synchronous functions that queue internal timers, and thus
// do not need to be awaited.
//
// NOTE: The provided AbortSignal is the controller that determines when the background workers stop listening for new
// work to do.
serviceLayer.taskExecutor.startWorker(dependencies.prisma, controller.signal)
serviceLayer.emailService.startWorker(controller.signal)

process.on("SIGTERM", () => controller.abort())
process.on("beforeExit", () => controller.abort())
process.on("exit", () => controller.abort())

controller.signal.addEventListener("abort", () => {
  logger.info("Abort signal received in process... Terminating dependent services...")
})

export async function createFastifyContext({ req }: CreateFastifyContextOptions) {
  const bearer = req.headers.authorization
  if (bearer !== undefined) {
    const token = bearer.substring("Bearer ".length)
    const principal = await jwtService.verify(token)
    const subject = principal.payload.sub
    if (subject === undefined) {
      return createTrpcContext(null, serviceLayer)
    }
    const editorRoles = await serviceLayer.authorizationService.getEditorRoles(serviceLayer.prisma, subject)
    return createTrpcContext(
      {
        subject,
        editorRoles,
      },
      serviceLayer
    )
  }

  return createTrpcContext(null, serviceLayer)
}

const server = fastify({
  maxParamLength: 5000,
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
  captureException(error)
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
registerStripeWebhookRoutes(server, serviceLayer)

// You can disable the entire authorization system with UNSAFE_DISABLE_AUTHORIZATION. This checks ensures this is NOT
// disabled in production-like environments.
const isOverridingAuthorization = process.env.UNSAFE_DISABLE_AUTHORIZATION === "true"
if (isOverridingAuthorization) {
  logger.warn("Authorization framework has been disabled. This is extremely unsafe and should only be done locally")
  if (["production", "staging"].includes(process.env.NODE_ENV ?? "")) {
    logger.error("Application has been configured to disable authorization in non-local development")
    process.exit(1)
  }
}

await identifyCallerIAMIdentity(configuration)
await server.listen({ port: 4444, host: "0.0.0.0" })

// In dev we instead use stripe's mock webhooks, run with: `pnpm run receive-stripe-webhooks`
if (configuration.STRIPE_WEBHOOK_IDENTIFIER !== "dev" && configuration.STRIPE_WEBHOOK_HOST !== null) {
  await serviceLayer.paymentWebhookService.registerWebhook(
    `${configuration.STRIPE_WEBHOOK_HOST}/webhook/stripe`,
    configuration.STRIPE_WEBHOOK_IDENTIFIER
  )
}
logger.info("Started RPC server on http://0.0.0.0:4444")
