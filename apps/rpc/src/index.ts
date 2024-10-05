import { S3Client } from "@aws-sdk/client-s3"
import { createKysely } from "@dotkomonline/db"
import {
  type AppRouter,
  type CreateContextOptions,
  JwtService,
  appRouter,
  createContext,
} from "@dotkomonline/gateway-trpc"
import fastifyCors from "@fastify/cors"
import { type FastifyTRPCPluginOptions, fastifyTRPCPlugin } from "@trpc/server/adapters/fastify"
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify"
import { ManagementClient } from "auth0"
import fastify from "fastify"
import Stripe from "stripe"
import { env } from "./env"

const allowedOrigins = env.ALLOWED_ORIGINS.split(",")
const oauthAudiences = env.OAUTH_AUDIENCES.split(",")

const jwtService = new JwtService(env.OAUTH_ISSUER, oauthAudiences)
const s3Client = new S3Client({
  region: env.AWS_REGION,
})
const auth0Client = new ManagementClient({
  domain: env.MANAGEMENT_TENANT_DOMAIN_ID,
  clientId: env.MANAGEMENT_OAUTH_CLIENT_ID,
  clientSecret: env.MANAGEMENT_OAUTH_CLIENT_SECRET,
})
const stripeAccounts = {
  trikom: {
    stripe: new Stripe(env.TRIKOM_STRIPE_SECRET_KEY, { apiVersion: "2023-08-16" }),
    publicKey: env.TRIKOM_STRIPE_PUBLIC_KEY,
    webhookSecret: env.TRIKOM_STRIPE_WEBHOOK_SECRET,
  },
  fagkom: {
    stripe: new Stripe(env.FAGKOM_STRIPE_SECRET_KEY, { apiVersion: "2023-08-16" }),
    publicKey: env.FAGKOM_STRIPE_PUBLIC_KEY,
    webhookSecret: env.FAGKOM_STRIPE_WEBHOOK_SECRET,
  },
}
const kysely = createKysely(env.DATABASE_URL)

export async function createFastifyContext({ req }: CreateFastifyContextOptions) {
  const bearer = req.headers.authorization
  const context: Omit<CreateContextOptions, "principal"> = {
    s3Client,
    s3BucketName: env.AWS_S3_BUCKET,
    stripeAccounts,
    managementClient: auth0Client,
    db: kysely,
  }
  if (bearer !== undefined) {
    const token = bearer.substring("Bearer ".length)
    const principal = await jwtService.verify(token)
    return createContext({ principal: principal.payload.sub ?? null, ...context })
  }

  return createContext({
    principal: null,
    ...context,
  })
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
      // report to error monitoring
      console.error(`Error in tRPC handler on path '${path}':`, error)
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
})

await server.listen({ port: 4444, host: "0.0.0.0" })
console.info("Started RPC server on http://0.0.0.0:4444")
