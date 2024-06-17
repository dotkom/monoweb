import { applyCorsMiddleware } from "@/middlewares/cors"
import { env } from "@dotkomonline/env"
import { JwtService, appRouter, createContext } from "@dotkomonline/gateway-trpc"
import { createNextApiHandler } from "@trpc/server/adapters/next"

const jwtService = new JwtService(env.WEB_AUTH0_ISSUER, [
  env.WEB_AUTH0_CLIENT_ID,
  env.DASHBOARD_AUTH0_CLIENT_ID,
  env.GTX_AUTH0_CLIENT_ID,
])

export default applyCorsMiddleware(
  createNextApiHandler({
    router: appRouter,
    createContext: async ({ req }) => {
      const bearer = req.headers.authorization
      if (bearer !== undefined) {
        const token = bearer.substring("Bearer ".length)
        const principal = await jwtService.verify(token)
        return createContext({ principal: principal.payload.sub ?? null })
      }
      return createContext({ principal: null })
    },
    onError({ error }) {
      console.error(error)
    },
  })
)
