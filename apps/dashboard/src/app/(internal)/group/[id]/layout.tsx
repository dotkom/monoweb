"use client"
import { Loader } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { type PropsWithChildren, use, useMemo } from "react"
import { useTRPC } from "@/lib/trpc-client"
import { GroupDetailsContext } from "./provider"

export default function GroupDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const trpc = useTRPC()
  const { id } = use(params)
  const { data, isLoading } = useQuery(trpc.group.get.queryOptions(id))
  const value = useMemo(
    () =>
      !data || isLoading
        ? null
        : {
            group: data,
          },
    [data, isLoading]
  )

  if (value === null) {
    return <Loader />
  }

  return <GroupDetailsContext.Provider value={value}>{children}</GroupDetailsContext.Provider>
}
