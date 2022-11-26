import { appRouter, createContext } from "core-api"
import { createNextApiHandler } from "@trpc/server/adapters/next"

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext,
})
