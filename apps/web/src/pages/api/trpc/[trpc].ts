import { appRouter, createContext } from "@dotkomonline/gateway-trpc"
import { createNextApiHandler } from "@trpc/server/adapters/next"
import { applyCorsMiddleware } from "@/middlewares/cors"
import { env } from "@dotkomonline/env"
import { JwtService } from "@dotkomonline/jwt-crypto"

// export API handler
export default applyCorsMiddleware(
  createNextApiHandler({
    router: appRouter,
    createContext: (args) => createContext(args, new JwtService(env.GTX_AUTH0_ISSUER)),
    onError({ error }) {
      console.error(error)
    },
  })
)
