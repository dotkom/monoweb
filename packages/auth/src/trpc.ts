import * as trpc from "@trpc/client"
import superjson from "superjson"

export const createServer = (rpcHost: string, accessToken: string) =>
  trpc.createTRPCUntypedClient({
    links: [
      trpc.httpLink({
        transformer: superjson,
        url: `${rpcHost}/api/trpc`,
        headers: async () => ({
          Authorization: `Bearer ${accessToken}`,
        }),
      }),
    ],
  })
