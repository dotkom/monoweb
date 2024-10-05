import { env } from "@/env"
import type { AppRouter } from "@dotkomonline/gateway-trpc"
import * as trpc from "@trpc/client"
import superjson from "superjson"

export const server = trpc.createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    trpc.httpLink({
      url: `${env.RPC_HOST}/api/trpc`,
      // TODO: Support authentication
    }),
  ],
})
