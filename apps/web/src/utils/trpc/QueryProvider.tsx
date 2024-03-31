"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type PropsWithChildren, useState } from "react"
import { trpcConfig, trpc } from "./client"

export const QueryProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() => trpc.createClient(trpcConfig))

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
