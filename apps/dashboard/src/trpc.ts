import { createTRPCReact } from "@trpc/react-query"
import { CreateTRPCClientOptions, httpBatchLink } from "@trpc/client"
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "@dotkomonline/api"
import superjson from "superjson"

const getBaseUrl = () => {
  if (import.meta.env.PROD) return "https://new.online.ntnu.no/"
  return `http://localhost:3000` // dev SSR should use localhost
}

export const trpcConfig: CreateTRPCClientOptions<AppRouter> = {
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
}

// React query trpc
export const trpc = createTRPCReact<AppRouter>()

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
