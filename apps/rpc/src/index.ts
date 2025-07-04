import "./instrumentation"

import { S3Client } from "@aws-sdk/client-s3"
import { createServiceLayer } from "@dotkomonline/core"
import { createPrisma } from "@dotkomonline/db"
import { type AppRouter, appRouter, createContext } from "@dotkomonline/gateway-trpc"
import { getLogger } from "@dotkomonline/logger"
import { JwtService } from "@dotkomonline/oauth2/jwt"
import fastifyCors from "@fastify/cors"
import { type FastifyTRPCPluginOptions, fastifyTRPCPlugin } from "@trpc/server/adapters/fastify"
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify"
import { ManagementClient } from "auth0"
import fastify from "fastify"
import Stripe from "stripe"
import { identifyCallerIAMIdentity } from "./aws"
import { env } from "./env"

const logger = getLogger("rpc")
const allowedOrigins = env.ALLOWED_ORIGINS.split(",")
const oauthAudiences = env.AUTH0_AUDIENCES.split(",")

const jwtService = new JwtService(env.AUTH0_ISSUER, oauthAudiences)

const s3Client = new S3Client({
  region: env.AWS_REGION,
})

const auth0Client = new ManagementClient({
  domain: env.AUTH0_MGMT_TENANT,
  clientId: env.AUTH0_CLIENT_ID,
  clientSecret: env.AUTH0_CLIENT_SECRET,
})

const stripeAccounts = {
  trikom: {
    stripe: new Stripe(env.TRIKOM_STRIPE_SECRET_KEY, {
      apiVersion: "2023-08-16",
    }),
    publicKey: env.TRIKOM_STRIPE_PUBLIC_KEY,
    webhookSecret: env.TRIKOM_STRIPE_WEBHOOK_SECRET,
  },
  fagkom: {
    stripe: new Stripe(env.FAGKOM_STRIPE_SECRET_KEY, {
      apiVersion: "2023-08-16",
    }),
    publicKey: env.FAGKOM_STRIPE_PUBLIC_KEY,
    webhookSecret: env.FAGKOM_STRIPE_WEBHOOK_SECRET,
  },
}

const adminPrincipals = env.ADMIN_USERS.split(",").map((sub) => sub.trim())
const prisma = createPrisma(env.DATABASE_URL)

const serviceLayer = await createServiceLayer({
  s3Client,
  s3BucketName: env.AWS_S3_BUCKET,
  stripeAccounts,
  db: prisma,
  managementClient: auth0Client,
})

serviceLayer.jobExecutor.initialize()

export async function createFastifyContext({ req }: CreateFastifyContextOptions) {
  const bearer = req.headers.authorization
  if (bearer !== undefined) {
    const token = bearer.substring("Bearer ".length)
    const principal = await jwtService.verify(token)
    return createContext(
      {
        adminPrincipals,
        principal: principal.payload.sub ?? null,
      },
      serviceLayer
    )
  }

  return createContext(
    {
      adminPrincipals,
      principal: null,
    },
    serviceLayer
  )
}

const server = fastify({
  maxParamLength: 5000,
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
    onError: ({ path, error }) => {
      logger.error(`Error in tRPC handler on path '${path}': %o`, error)
      if (error.cause instanceof AggregateError) {
        for (const err of error.cause.errors) {
          logger.error(`  AggregateError Child in tRPC handler on path '${path}': %o`, err)
        }
      }
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
})

server.get("/health", (_, res) => {
  res.send({ status: "ok" })
})

await identifyCallerIAMIdentity()
await server.listen({ port: 4444, host: "0.0.0.0" })
logger.info("Started RPC server on http://0.0.0.0:4444")
