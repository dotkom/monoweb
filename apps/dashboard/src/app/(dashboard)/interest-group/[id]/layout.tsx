"use client"
import { Loader } from "@mantine/core"
import { type PropsWithChildren, use, useMemo } from "react"
import { useTRPC } from "../../../../trpc"
import { InterestGroupDetailsContext } from "./provider"

import { useQuery } from "@tanstack/react-query"

export default function InterestGroupDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const trpc = useTRPC()
  const { id } = use(params)
  const { data, isLoading } = useQuery(trpc.interestGroup.get.queryOptions(id))
  const value = useMemo(
    () =>
      !data || isLoading
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
