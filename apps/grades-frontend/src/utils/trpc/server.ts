import { env } from "@/env"
import type { AppRouter } from "@dotkomonline/grades-backend"
import * as trpc from "@trpc/client"
import superjson from "superjson"

export const server = trpc.createTRPCProxyClient<AppRouter>({
  links: [
    trpc.httpLink({
      transformer: superjson,
      url: `${env.BACKEND_HOST}/api/trpc`,
    }),
  ],
})
