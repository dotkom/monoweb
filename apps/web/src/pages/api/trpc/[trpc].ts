import { appRouter, createContext } from "@dotkomonline/gateway-trpc"
import { createNextApiHandler } from "@trpc/server/adapters/next"
import { applyCorsMiddleware } from "@/middlewares/cors"
import { env } from "@dotkomonline/env"

// export API handler
export default applyCorsMiddleware(
  createNextApiHandler({
    router: appRouter,
    createContext: (args) => createContext(args, env),
    onError({ error }) {
      console.error(error)
    },
  })
)
