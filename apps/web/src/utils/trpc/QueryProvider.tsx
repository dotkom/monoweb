"use client"

import { env } from "@/env"
import type { AppRouter } from "@dotkomonline/gateway-trpc"
import { useSession } from "@dotkomonline/oauth2/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type CreateTRPCClientOptions, createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client"
import { type PropsWithChildren, useState } from "react"
import superjson from "superjson"
import { TRPCProvider } from "./client"

export const QueryProvider = ({ children }: PropsWithChildren) => {
  const session = useSession()
  const headers = new Headers()

  if (session !== null) {
    headers.append("Authorization", `Bearer ${session.accessToken}`)
  }

  const trpcConfig: CreateTRPCClientOptions<AppRouter> = {
    links: [
      loggerLink({
        enabled: (opts) =>
          env.NEXT_PUBLIC_ORIGIN === "development" || (opts.direction === "down" && opts.result instanceof Error),
      }),
      httpBatchLink({
        transformer: superjson,
        url: `${env.NEXT_PUBLIC_RPC_HOST}/api/trpc`,
        async fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
            headers,
          })
        },
      }),
    ],
  }
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() => createTRPCClient(trpcConfig))

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TRPCProvider>
  )
}
