"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PropsWithChildren, useState } from "react"
import { trpcConfig, trpc } from "../utils/trpc"

export const QueryProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() => trpc.createClient(trpcConfig))

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
