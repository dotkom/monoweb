"use client"

import type { AppRouter } from "@dotkomonline/gateway-trpc"
import { type CreateTRPCClientOptions, httpBatchLink, loggerLink } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import superjson from "superjson"

const getBaseUrl = () => {
  if (env.NEXT_PUBLIC_NODE_ENV === "production") {
    return "https://web.online.ntnu.no"
  }
  return "http://localhost:3000"
}

export const trpcConfig: CreateTRPCClientOptions<AppRouter> = {
  transformer: superjson,
  links: [
    loggerLink({
      enabled: (opts) =>
        env.NEXT_PUBLIC_NODE_ENV === "development" || (opts.direction === "down" && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
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
