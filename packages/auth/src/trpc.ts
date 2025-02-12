import * as trpc from "@trpc/client"
import superjson from "superjson"

export const createServer = (rpcHost: string, accessToken: string) =>
  trpc.createTRPCUntypedClient({
    transformer: superjson,
    links: [
      trpc.httpLink({
        url: `${rpcHost}/api/trpc`,
        headers: async () => ({
          Authorization: `Bearer ${accessToken}`,
        }),
      }),
    ],
  })
