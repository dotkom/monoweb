"use client"

import { env } from "@/env"
import type { AppRouter } from "@dotkomonline/gateway-trpc"
import { type CreateTRPCClientOptions, httpBatchLink, loggerLink } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import superjson from "superjson"

export const trpcConfig: CreateTRPCClientOptions<AppRouter> = {
  transformer: superjson,
  links: [
    loggerLink({
      enabled: (opts) =>
        env.NEXT_PUBLIC_ORIGIN === "development" || (opts.direction === "down" && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: `${env.NEXT_PUBLIC_ORIGIN}/api/trpc`,
      async fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        })
      },
    }),
  ],
}

// React query trpc
export const trpc = createTRPCReact<AppRouter>({})
