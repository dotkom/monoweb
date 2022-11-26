import { appRouter, createContext } from "@dotkomonline/api"
import { createNextApiHandler } from "@trpc/server/adapters/next"

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext,
})
