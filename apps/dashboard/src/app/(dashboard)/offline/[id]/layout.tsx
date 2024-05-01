"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, useMemo } from "react"
import { trpc } from "../../../../utils/trpc"
import { OfflineDetailsContext } from "./provider"

export default function OfflineDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const { data, isLoading } = trpc.offline.get.useQuery(params.id)
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
