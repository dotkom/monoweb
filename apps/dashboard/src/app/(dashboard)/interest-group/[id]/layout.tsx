"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, use, useMemo } from "react"
import { trpc } from "../../../../trpc"
import { InterestGroupDetailsContext } from "./provider"

export default function InterestGroupDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params)
  const { data, isLoading } = trpc.interestGroup.get.useQuery(id)
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
