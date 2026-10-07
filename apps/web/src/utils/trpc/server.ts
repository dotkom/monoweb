import { getServerAccessToken } from "@/lib/server-access-token"
import { env } from "@/env"
import type { AppRouter } from "@dotkomonline/rpc"
import { RpcRequestSource, getRpcRequestSourceHeaders } from "@dotkomonline/utils"
import * as trpc from "@trpc/client"
import superjson from "superjson"

function createServerClient(getAccessToken: () => Promise<string | null>) {
  return trpc.createTRPCProxyClient<AppRouter>({
    links: [
      trpc.httpLink({
        transformer: superjson,
        url: `${env.RPC_HOST}/api/trpc`,
        headers: async () => {
          const accessToken = await getAccessToken()
          const headers = getRpcRequestSourceHeaders(RpcRequestSource.Web)

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
}

export const server = createServerClient(getServerAccessToken)

export function createServerClientWithAccessToken(accessToken: string) {
  return createServerClient(async () => accessToken)
}
