import { env } from "@dotkomonline/env"
import { type AppRouter, JwtService, appRouter, createContext } from "@dotkomonline/gateway-trpc"
import fastifyCors from "@fastify/cors"
import { type FastifyTRPCPluginOptions, fastifyTRPCPlugin } from "@trpc/server/adapters/fastify"
import type { CreateFastifyContextOptions } from "@trpc/server/dist/adapters/fastify"
import fastify from "fastify"

const jwtService = new JwtService(env.WEB_AUTH0_ISSUER, [
  env.WEB_AUTH0_CLIENT_ID,
  env.DASHBOARD_AUTH0_CLIENT_ID,
  env.GTX_AUTH0_CLIENT_ID,
])

export async function createFastifyContext({ req }: CreateFastifyContextOptions) {
  const bearer = req.headers.authorization
  if (bearer !== undefined) {
    const token = bearer.substring("Bearer ".length)
    const principal = await jwtService.verify(token)
    return createContext({ principal: principal.payload.sub ?? null })
  }

  return createContext({
    principal: null,
  })
}

const server = fastify({
  maxParamLength: 5000,
})
server.register(fastifyCors, {
  origin: ["http://localhost:3000", "http://localhost:3002"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
})

server.register(fastifyTRPCPlugin, {
  prefix: "/api/trpc",
  trpcOptions: {
    router: appRouter,
    createContext: createFastifyContext,
    onError({ path, error }) {
      // report to error monitoring
      console.error(`Error in tRPC handler on path '${path}':`, error)
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
})

await server.listen({ port: 4444 })
