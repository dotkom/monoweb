"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type PropsWithChildren, useState } from "react"
import { trpc, trpcConfig } from "../utils/trpc"

export const QueryProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: process.env.NODE_ENV === "production" ? 3 : 0
          },
        },
      })
  )
  const [trpcClient] = useState(() => trpc.createClient(trpcConfig))

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
