import { auth0 } from "@/auth"
import { env } from "@/env"
import type { AppRouter } from "@dotkomonline/rpc"
import * as trpc from "@trpc/client"
import superjson from "superjson"

export const server = trpc.createTRPCProxyClient<AppRouter>({
  links: [
    trpc.httpLink({
      transformer: superjson,
      url: `${env.RPC_HOST}/api/trpc`,
      headers: async () => {
        try {
          const { token } = await auth0.getAccessToken()
          return { Authorization: `Bearer ${token}` }
        } catch {
          return {}
        }
      },
    }),
  ],
})
