import { auth } from "@/auth"
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
        const token = await auth.getServerSession()
        if (token !== null) {
          return { Authorization: `Bearer ${token.accessToken}` }
        }
        return {}
      },
    }),
  ],
})
