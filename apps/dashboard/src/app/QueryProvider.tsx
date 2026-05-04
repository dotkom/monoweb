"use client"

import { env } from "@/lib/env"
import { TRPCProvider } from "@/lib/trpc-client"
import { getAccessToken } from "@auth0/nextjs-auth0"
import type { AppRouter } from "@dotkomonline/rpc"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type CreateTRPCClientOptions, createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client"
import { type PropsWithChildren, useMemo, useState } from "react"
import superjson from "superjson"

export const QueryProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: process.env.NODE_ENV === "production" ? 3 : 0,
          },
          mutations: {
            onError: console.error,
          },
        },
      })
  )

  const trpcConfig: CreateTRPCClientOptions<AppRouter> = useMemo(
    () => ({
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
              try {
                const token = await getAccessToken()
                if (typeof token === "string" && token !== "") {
                  headers.set("Authorization", `Bearer ${token}`)
                }
              } catch {
                // not authenticated
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
    }),
    []
  )

  const trpcClient = useMemo(() => createTRPCClient(trpcConfig), [trpcConfig])

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TRPCProvider>
  )
}
