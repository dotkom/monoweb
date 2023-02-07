import { createTRPCNext } from "@trpc/next"
import { CreateTRPCClientOptions, createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client"
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "@dotkomonline/api"
import superjson from "superjson"

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "" // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}` // dev SSR should use localhost
}

const config: CreateTRPCClientOptions<AppRouter> = {
  transformer: superjson,
  links: [
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === "development" || (opts.direction === "down" && opts.result instanceof Error),
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
