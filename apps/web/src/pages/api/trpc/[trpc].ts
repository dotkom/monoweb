import { appRouter, createContext } from "@dotkomonline/api"
import { createNextApiHandler } from "@trpc/server/adapters/next"
import { applyCorsMiddleware } from "@/middlewares/cors"

// export API handler
export default applyCorsMiddleware(
  createNextApiHandler({
    router: appRouter,
    createContext,
  })
)
