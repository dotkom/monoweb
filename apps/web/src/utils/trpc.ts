import { createTRPCNext } from "@trpc/next"
import { type CreateTRPCClientOptions, createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client"
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server"
import { type AppRouter } from "@dotkomonline/gateway-trpc"
import superjson from "superjson"
import { env } from "@dotkomonline/env"

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return ""
  }
  if (env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${env.VERCEL_URL}`
  }
  return "http://localhost:3000"
}

const config: CreateTRPCClientOptions<AppRouter> = {
  transformer: superjson,
  links: [
    loggerLink({
      enabled: (opts) =>
        env.NEXT_PUBLIC_NODE_ENV === "development" || (opts.direction === "down" && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
}

// Vanilla fetch client
export const trpcClient = createTRPCProxyClient<AppRouter>(config)

// React query trpc
export const trpc = createTRPCNext<AppRouter>({
  config() {
    return config
  },
  ssr: false,
})

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>
