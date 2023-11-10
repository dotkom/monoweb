"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren } from "react"
import { OfflineDetailsContext } from "./provider"
import { trpc } from "../../../../utils/trpc"

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
