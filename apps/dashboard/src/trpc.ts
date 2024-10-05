"use client"

import type { AppRouter } from "@dotkomonline/gateway-trpc"
import { type CreateTRPCClientOptions, httpBatchLink, loggerLink } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import superjson from "superjson"
import { env } from "./env"

export const trpcConfig: CreateTRPCClientOptions<AppRouter> = {
  transformer: superjson,
  links: [
    loggerLink({
      enabled: (opts) =>
        env.NEXT_PUBLIC_ORIGIN.includes("localhost") || (opts.direction === "down" && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: `${env.NEXT_PUBLIC_ORIGIN}/api/trpc`,
      async fetch(url, options) {
        try {
          const result = await fetch(url, {
            ...options,
            credentials: "include",
          })
          return result
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

export const trpc = createTRPCReact<AppRouter>({
  overrides: {
    useMutation: {
      async onSuccess(opts) {
        // Note that the order of operations here matter. The order allows route changes in `onSuccess` without
        // having a flash of content change whilst redirecting.
        // Calls the `onSuccess` defined in the `useMutation()`-options:
        await opts.originalFn()
        // Invalidate all queries in the react-query cache:
        await opts.queryClient.invalidateQueries()
      },
    },
  },
})
