"use client"

import { Loader } from "@mantine/core"
import type { PropsWithChildren } from "react"
import { trpc } from "../../../../utils/trpc"
import { OfflineDetailsContext } from "./provider"

export default function OfflineDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const { data, isLoading } = trpc.offline.get.useQuery(params.id)
  return (
    <>
      {isLoading || !data ? (
        <Loader />
      ) : (
        <OfflineDetailsContext.Provider value={{ offline: data }}>{children}</OfflineDetailsContext.Provider>
      )}
    </>
  )
}
