import { appRouter, createContext } from "@dotkomonline/gateway-trpc"
import { createNextApiHandler } from "@trpc/server/adapters/next"
import { applyCorsMiddleware } from "@/middlewares/cors"

import { getLogger } from "@dotkomonline/logger"

export const logger = getLogger("migrator")

// export API handler
export default applyCorsMiddleware(
  createNextApiHandler({
    router: appRouter,
    createContext,
    onError({ error }) {
      console.error(error)
    },
  })
)
