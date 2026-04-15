"use client"

import { env } from "@/env"
import { getAccessToken, useUser } from "@auth0/nextjs-auth0"
import type { AppRouter } from "@dotkomonline/rpc"
import { createClearSessionUrl, isAccessTokenFetchFailure, toAbsoluteUrl } from "@dotkomonline/utils"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  type CreateTRPCClientOptions,
  createTRPCClient,
  httpBatchLink,
  httpSubscriptionLink,
  loggerLink,
  splitLink,
} from "@trpc/client"
import { minutesToMilliseconds } from "date-fns"
import {
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react"
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

// This lock is to prevent the redirect from being triggered multiple times. Next.js usually sends tons of parallel
// requests, and we only want to redirect once.
let recoveryRedirectScheduled = false

// Deduplicate parallel client-side access token fetches into one in-flight request.
let accessTokenRequest: Promise<string> | null = null

async function fetchSharedAccessToken(): Promise<string | undefined> {
  if (accessTokenRequest === null) {
    accessTokenRequest = getAccessToken().finally(() => {
      accessTokenRequest = null
    })
  }

  const token = await accessTokenRequest

  if (typeof token === "string" && token !== "") {
    return token
  }

  return undefined
}

export const useTRPCSSERegisterChangeConnectionState = () => {
  const context = useContext(TRPCSSERegisterChangeConnectionStateContext)
  if (!context) {
    throw new Error("useTRPCSSERegisterChangeConnectionState() can only be used inside of a <TRPCProvider>")
  }
  return context
}

export const QueryProvider = ({ children }: PropsWithChildren) => {
  const { user } = useUser()
  const userId = user?.sub

  const [trpcSSERegisterChangeConnectionState, setTRPCSSERegisterChangeConnectionState] =
    useState<TRPCSSEConnectionState>("connecting")

  const trpcConfig: CreateTRPCClientOptions<AppRouter> = useMemo(() => {
    const hasAuthenticatedUser = typeof userId === "string" && userId !== ""

    return {
      links: [
        loggerLink({
          enabled: (opts) => opts.direction === "down" && opts.result instanceof Error,
        }),
        splitLink({
          condition: (op) => op.type === "subscription",
          true: httpSubscriptionLink({
            transformer: superjson,
            url: `${env.NEXT_PUBLIC_RPC_HOST}/api/trpc`,
            async connectionParams() {
              if (!hasAuthenticatedUser) {
                return {}
              }

              try {
                const token = await getAccessToken()

                if (typeof token === "string" && token !== "") {
                  return { token }
                }
              } catch {
                // not authenticated
              }

              return {}
            },
          }),
          false: httpBatchLink({
            transformer: superjson,
            url: `${env.NEXT_PUBLIC_RPC_HOST}/api/trpc`,
            async fetch(url, options) {
              const headers = new Headers(options?.headers)

              try {
                const token = await fetchSharedAccessToken()

                if (token !== undefined) {
                  headers.set("Authorization", `Bearer ${token}`)
                }
              } catch (error) {
                if (isAccessTokenFetchFailure(error) && recoveryRedirectScheduled === false) {
                  recoveryRedirectScheduled = true
                  window.location.assign(
                    createClearSessionUrl({
                      returnTo: toAbsoluteUrl(
                        window.location.origin,
                        `${window.location.pathname}${window.location.search}`
                      ),
                    })
                  )
                }
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
  }, [userId])

  const trpcClient = useMemo(() => createTRPCClient(trpcConfig), [trpcConfig])

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
