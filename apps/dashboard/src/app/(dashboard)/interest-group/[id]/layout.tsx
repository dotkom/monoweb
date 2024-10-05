"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, useMemo } from "react"
import { trpc } from "../../../../trpc"
import { InterestGroupDetailsContext } from "./provider"

export default function InterestGroupDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: { id: string } }>) {
  const { data, isLoading } = trpc.interestGroup.get.useQuery(params.id)
  const value = useMemo(
    () =>
      data === undefined || isLoading
        ? null
        : {
            interestGroup: data,
          },
    [data, isLoading]
  )

  if (value === null) {
    return <Loader />
  }

  return <InterestGroupDetailsContext.Provider value={value}>{children}</InterestGroupDetailsContext.Provider>
}
