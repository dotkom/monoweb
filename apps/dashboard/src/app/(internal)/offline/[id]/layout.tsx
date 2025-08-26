"use client"
import { useTRPC } from "@/lib/trpc-client"
import { Loader } from "@mantine/core"
import { type PropsWithChildren, use, useMemo } from "react"
import { OfflineDetailsContext } from "./provider"

import { useQuery } from "@tanstack/react-query"

export default function OfflineDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const trpc = useTRPC()
  const { id } = use(params)
  const { data, isLoading } = useQuery(trpc.offline.get.queryOptions(id))
  const value = useMemo(
    () =>
      !data || isLoading
        ? null
        : {
            offline: data,
          },
    [data, isLoading]
  )

  if (value === null) {
    return <Loader />
  }

  return <OfflineDetailsContext.Provider value={value}>{children}</OfflineDetailsContext.Provider>
}
