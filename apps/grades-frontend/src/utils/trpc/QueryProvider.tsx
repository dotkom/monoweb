"use client"

import { env } from "@/env"
import type { AppRouter } from "@dotkomonline/grades-backend"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type CreateTRPCClientOptions, createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client"
import { minutesToMilliseconds } from "date-fns"
import { type PropsWithChildren, useMemo, useState } from "react"
import superjson from "superjson"
import { TRPCProvider } from "./client"

export const QueryProvider = ({ children }: PropsWithChildren) => {
  const trpcConfig: CreateTRPCClientOptions<AppRouter> = useMemo(
    () => ({
      links: [
        loggerLink({
          enabled: (opts) => opts.direction === "down" && opts.result instanceof Error,
        }),
        httpBatchLink({
          transformer: superjson,
          url: `${env.NEXT_PUBLIC_BACKEND_HOST}/api/trpc`,
          fetch(url, options) {
            try {
              return fetch(url, {
                ...options,
                credentials: "include",
                headers: options?.headers,
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

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: minutesToMilliseconds(5),
            retry: false,
          },
          mutations: {
            onError: console.error,
            retry: false,
          },
        },
      })
  )

  const trpcClient = useMemo(() => createTRPCClient(trpcConfig), [trpcConfig])

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TRPCProvider>
  )
}
