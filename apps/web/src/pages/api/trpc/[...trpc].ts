import { applyCorsMiddleware } from "@/middlewares/cors"
import { createNextApiHandler } from "@trpc/server/adapters/next"
import { appRouter, createContext } from "@dotkomonline/gateway-trpc"

export default applyCorsMiddleware(
  createNextApiHandler({
    router: appRouter,
    createContext,
    onError({ error }) {
      console.error(error)
    },
  })
)
