"use client"

import { Loader } from "@mantine/core"
import type { PropsWithChildren } from "react"
import { trpc } from "../../../../utils/trpc"
import { InterestGroupDetailsContext } from "./provider"

export default function OfflineDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const { data, isLoading } = trpc.interestGroup.get.useQuery(params.id)
  return (
    <>
      {isLoading || !data ? (
        <Loader />
      ) : (
        <InterestGroupDetailsContext.Provider value={{ interestGroup: data }}>
          {children}
        </InterestGroupDetailsContext.Provider>
      )}
    </>
  )
}
