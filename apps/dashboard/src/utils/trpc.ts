"use client";

import type { AppRouter } from "@dotkomonline/gateway-trpc";

import { env } from "@dotkomonline/env";
import { type CreateTRPCClientOptions, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

const getBaseUrl = () => {
  if (env.NEXT_PUBLIC_NODE_ENV === "production") {
    return "https://new.online.ntnu.no/";
  }

  if (env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  return "http://localhost:3000";
};

export const trpcConfig: CreateTRPCClientOptions<AppRouter> = {
  links: [
    loggerLink({
      enabled: (opts) =>
        env.NEXT_PUBLIC_NODE_ENV === "development" || (opts.direction === "down" && opts.result instanceof Error),
    }),
    httpBatchLink({
      async fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
  transformer: superjson,
};

// React query trpc
export const trpc = createTRPCReact<AppRouter>();

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;
