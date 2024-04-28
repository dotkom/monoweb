import { applyCorsMiddleware } from "@/middlewares/cors"
import { appRouter, createContext } from "@dotkomonline/gateway-trpc"
import { createNextApiHandler } from "@trpc/server/adapters/next"

export default applyCorsMiddleware(
  createNextApiHandler({
    router: appRouter,
    createContext,
    onError({ error }) {
      console.error(error)
    },
  })
)
