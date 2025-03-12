"use client"

import type { AppRouter } from "@dotkomonline/gateway-trpc"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type CreateTRPCClientOptions, createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client"
import { type PropsWithChildren, useState } from "react"
import { env } from "src/env"
import superjson from "superjson"
import { TRPCProvider } from "../trpc"

export const trpcConfig: CreateTRPCClientOptions<AppRouter> = {
  links: [
    loggerLink({
      enabled: (opts) =>
        env.NEXT_PUBLIC_ORIGIN.includes("localhost") || (opts.direction === "down" && opts.result instanceof Error),
    }),
    httpBatchLink({
      transformer: superjson,
      url: `${env.NEXT_PUBLIC_ORIGIN}/api/trpc`,
      async fetch(url, options) {
        try {
          return await fetch(url, {
            ...options,
            credentials: "include",
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

export const QueryProvider = ({ children }: PropsWithChildren) => {
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
  const [trpcClient] = useState(() => createTRPCClient(trpcConfig))

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TRPCProvider>
  )
}
