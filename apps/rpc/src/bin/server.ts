import "../instrumentation"

import { getLogger } from "@dotkomonline/logger"
import { JwtService } from "@dotkomonline/oauth2/jwt"
import fastifyCors from "@fastify/cors"
import { captureException } from "@sentry/node"
import { type FastifyTRPCPluginOptions, fastifyTRPCPlugin } from "@trpc/server/adapters/fastify"
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify"
import fastify from "fastify"
import { type AppRouter, appRouter } from "../app-router"
import { identifyCallerIAMIdentity } from "../aws"
import { configuration } from "../configuration"
import { createServiceLayer, createThirdPartyClients } from "../modules/core"
import { createContext } from "../trpc"
import z from "zod"

const logger = getLogger("rpc")
const allowedOrigins = configuration.ALLOWED_ORIGINS.split(",")
const oauthAudiences = configuration.AUTH0_AUDIENCES.split(",")
const adminPrincipals = configuration.ADMIN_USERS.split(",")
const jwtService = new JwtService(configuration.AUTH0_ISSUER, oauthAudiences)

const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration)

// This spins of all potentially remaining jobs in the queue that this system was not aware of. For this reason, it does
// not need to be awaited. While the task execution itself is not blocked on, await here adds unnecessary latency to the
// server startup.
void serviceLayer.startTaskExecutor()

export async function createFastifyContext({ req }: CreateFastifyContextOptions) {
  const bearer = req.headers.authorization
  if (bearer !== undefined) {
    const token = bearer.substring("Bearer ".length)
    const principal = await jwtService.verify(token)
    const subject = principal.payload.sub
    if (subject === undefined) {
      return createContext(null, serviceLayer)
    }
    const affiliations = await serviceLayer.authorizationService.getAffiliations(serviceLayer.prisma, subject)
    return createContext(
      {
        subject,
        affiliations,
      },
      serviceLayer
    )
  }
  return createContext(null, serviceLayer)
}

const server = fastify({
  maxParamLength: 5000,
})
server.setErrorHandler((error) => {
  console.error(error)
  captureException(error)
})
server.register(fastifyCors, {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
})

server.register(fastifyTRPCPlugin, {
  prefix: "/api/trpc",
  trpcOptions: {
    router: appRouter,
    createContext: createFastifyContext,
    onError: ({ path, input, error }) => {
      captureException(error)
      // logger.error(`Error in tRPC handler on path '${path}': %o`, error)
      logger.error(`${path}: ${JSON.stringify(input)}`)
      console.error(error)
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
})

server.get("/health", (_, res) => {
  res.send({ status: "ok" })
})

server.post("/webhook/stripe", async (req, res) => {
  const checkoutSessionCompletedSchema = z.object({
    type: z.literal("checkout.session.completed"),
    data: z.object({
      object: z.object({
        id: z.string(),
      }),
    }),
  })

  const { data: payload, success } = checkoutSessionCompletedSchema.safeParse(req.body)
  if (success) {
    await serviceLayer.attendeeService.handleOnPaymentTask(serviceLayer.prisma, payload.data.object.id)
  }

  res.status(204)
})

await identifyCallerIAMIdentity()
await server.listen({ port: 4444, host: "0.0.0.0" })
logger.info("Started RPC server on http://0.0.0.0:4444")
