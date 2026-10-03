import { getServerAccessToken } from "@admin/lib/server-access-token"
import { env } from "@admin/lib/env"
import type { AppRouter } from "@dotkomonline/rpc"
import { RpcRequestSource, getRpcRequestSourceHeaders } from "@dotkomonline/utils"
import * as trpc from "@trpc/client"
import superjson from "superjson"

export const server = trpc.createTRPCProxyClient<AppRouter>({
  links: [
    trpc.httpLink({
      transformer: superjson,
      url: `${env.RPC_HOST}/api/trpc`,
      headers: async () => {
        const accessToken = await getServerAccessToken()
        const headers = getRpcRequestSourceHeaders(RpcRequestSource.Admin)

        if (accessToken === null) {
          return headers
        }

        return {
          ...headers,
          Authorization: `Bearer ${accessToken}`,
        }
      },
    }),
  ],
})
