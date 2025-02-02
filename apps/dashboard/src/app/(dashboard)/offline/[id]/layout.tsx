"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, useMemo } from "react"
import { trpc } from "../../../../trpc"
import { OfflineDetailsContext } from "./provider"

export default async function OfflineDetailsLayout({ children, params }: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = await params
  const { data, isLoading } = trpc.offline.get.useQuery(id)
  const value = useMemo(
    () =>
      data === undefined || isLoading
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
