"use client"
import { Loader } from "@mantine/core"
import { type PropsWithChildren, use } from "react"

import { useGroupGetQuery, useGroupMemberGetQuery } from "../../queries"
import { GroupDetailsContext } from "../provider"
import { GroupMemberDetailsContext } from "./provider"

export default function GroupMemberDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string; memberId: string }> }>) {
  const { id: groupId, memberId } = use(params)
  const userId = decodeURIComponent(memberId)

  const { data: groupMember } = useGroupMemberGetQuery(groupId, userId)
  const { data: group } = useGroupGetQuery(groupId)

  if (!groupMember || !group) {
    return <Loader />
  }

  return (
    <GroupDetailsContext.Provider value={{ group }}>
      <GroupMemberDetailsContext.Provider value={{ groupMember }}>{children}</GroupMemberDetailsContext.Provider>
    </GroupDetailsContext.Provider>
  )
}
