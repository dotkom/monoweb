import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter, createContext } from "@dotkomonline/gateway-trpc"

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  })
}

export { handler as GET, handler as POST }
