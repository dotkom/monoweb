import { getServerAccessToken } from "@/lib/server-access-token"
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
        const accessToken = await getServerAccessToken()

        if (accessToken === null) {
          return {}
        }

        return { Authorization: `Bearer ${accessToken}` }
      },
    }),
  ],
})
