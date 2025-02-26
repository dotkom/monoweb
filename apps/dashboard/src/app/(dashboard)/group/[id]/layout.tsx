"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, use, useMemo } from "react"
import { trpc } from "../../../../trpc"
import { GroupDetailsContext } from "./provider"

export default function GroupDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params)
  const { data, isLoading } = trpc.group.get.useQuery(id)
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
