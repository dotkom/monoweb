"use client"

import { env } from "@/env"
import { useSession } from "@dotkomonline/oauth2/react"
import type { AppRouter } from "@dotkomonline/rpc"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  type CreateTRPCClientOptions,
  createTRPCClient,
  httpBatchLink,
  httpSubscriptionLink,
  loggerLink,
  splitLink,
} from "@trpc/client"
import { secondsToMilliseconds } from "date-fns"
import { type Dispatch, type PropsWithChildren, type SetStateAction, createContext, useContext, useState } from "react"
import superjson from "superjson"
import { TRPCProvider } from "./client"

// connecting is default, pending is when it is open, and idle idk
export type TRPCSSEConnectionState = "connecting" | "pending" | "idle"

export interface TRPCSSERegisterChangeConnectionStateContextType {
  trpcSSERegisterChangeConnectionState: TRPCSSEConnectionState
  setTRPCSSERegisterChangeConnectionState: Dispatch<SetStateAction<TRPCSSEConnectionState>>
}

const TRPCSSERegisterChangeConnectionStateContext =
  createContext<TRPCSSERegisterChangeConnectionStateContextType | null>(null)

export const useTRPCSSERegisterChangeConnectionState = () => {
  const context = useContext(TRPCSSERegisterChangeConnectionStateContext)
  if (!context) {
    throw new Error("useTRPCSSERegisterChangeConnectionState() can only be used inside of a <TRPCProvider>")
  }
  return context
}

export const QueryProvider = ({ children }: PropsWithChildren) => {
  const session = useSession()
  const [trpcSSERegisterChangeConnectionState, setTRPCSSERegisterChangeConnectionState] =
    useState<TRPCSSEConnectionState>("connecting")

  const trpcConfig: CreateTRPCClientOptions<AppRouter> = {
    links: [
      loggerLink({
        enabled: (opts) =>
          env.NEXT_PUBLIC_ORIGIN === "development" || (opts.direction === "down" && opts.result instanceof Error),
      }),
      splitLink({
        condition: (op) => op.type === "subscription",
        true: httpSubscriptionLink({
          transformer: superjson,
          url: `${env.NEXT_PUBLIC_RPC_HOST}/api/trpc`,
        }),
        false: httpBatchLink({
          transformer: superjson,
          url: `${env.NEXT_PUBLIC_RPC_HOST}/api/trpc`,
          async fetch(url, options) {
            const headers = new Headers(options?.headers)

            if (session !== null) {
              headers.append("Authorization", `Bearer ${session.accessToken}`)
            }
            return fetch(url, {
              ...options,
              credentials: "include",
              headers,
            })
          },
        }),
      }),
    ],
  }
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: secondsToMilliseconds(30),
          },
          mutations: {
            onError: console.error,
          },
        },
      })
  )
  const [trpcClient] = useState(() => createTRPCClient(trpcConfig))

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <TRPCSSERegisterChangeConnectionStateContext.Provider
          value={{
            trpcSSERegisterChangeConnectionState,
            setTRPCSSERegisterChangeConnectionState,
          }}
        >
          {children}
        </TRPCSSERegisterChangeConnectionStateContext.Provider>
      </QueryClientProvider>
    </TRPCProvider>
  )
}
