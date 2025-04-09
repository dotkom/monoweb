"use client"

import type { AppRouter } from "@dotkomonline/gateway-trpc"
import { useSession } from "@dotkomonline/oauth2/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type CreateTRPCClientOptions, createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client"
import { type PropsWithChildren, useState } from "react"
import { env } from "src/env"
import superjson from "superjson"
import { TRPCProvider } from "../trpc"

export const QueryProvider = ({ children }: PropsWithChildren) => {
  const session = useSession()

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: process.env.NODE_ENV === "production" ? 3 : 0,
          },
        },
      })
  )
  const trpcConfig: CreateTRPCClientOptions<AppRouter> = {
    links: [
      loggerLink({
        enabled: (opts) =>
          env.NEXT_PUBLIC_ORIGIN.includes("localhost") || (opts.direction === "down" && opts.result instanceof Error),
      }),
      httpBatchLink({
        transformer: superjson,
        url: `${env.NEXT_PUBLIC_RPC_HOST}/api/trpc`,
        async fetch(url, options) {
          try {
            const headers = new Headers(options?.headers)

            if (session !== null) {
              headers.append("Authorization", `Bearer ${session.accessToken}`)
            }
  
            return fetch(url, {
              ...options,
              credentials: "include",
              headers,
            })
          } catch (e) {
            console.error(
              "The fetch call to the TRPC api failed, the TRPC server may be down! Check if the TRPC server is up and running"
            )
            throw e
          }
        },
      }),
    ],
  }
  const [trpcClient] = useState(() => createTRPCClient(trpcConfig))

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TRPCProvider>
  )
}
