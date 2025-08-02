"use client"
import { useTRPC } from "@/lib/trpc"
import { Loader } from "@mantine/core"
import { type PropsWithChildren, use, useMemo } from "react"

import { useQuery } from "@tanstack/react-query"
import { useGroupGetQuery } from "../../queries"
import { GroupDetailsContext } from "../provider"
import { GroupMemberDetailsContext } from "./provider"

export default function GroupMemberDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string; memberId: string }> }>) {
  const trpc = useTRPC()
  const { id: groupId, memberId } = use(params)
  const userId = decodeURIComponent(memberId)

  const { data, isLoading } = useQuery(trpc.group.getMember.queryOptions({ groupId, userId }))
  const value = useMemo(
    () =>
      !data || isLoading
        ? null
        : {
            groupMember: data,
          },
    [data, isLoading]
  )

  const { data: group } = useGroupGetQuery(groupId)

  if (value === null || group === undefined) {
    return <Loader />
  }

  return (
    <GroupDetailsContext.Provider value={{ group }}>
      <GroupMemberDetailsContext.Provider value={value}>{children}</GroupMemberDetailsContext.Provider>
    </GroupDetailsContext.Provider>
  )
}
