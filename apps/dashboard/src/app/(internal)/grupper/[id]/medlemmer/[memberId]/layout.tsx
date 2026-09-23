"use client"

import { ResourceDetailError } from "@/components/ResourceDetailLayout/ResourceDetailError"
import { type PropsWithChildren, use } from "react"
import { useGroupMemberGetQuery } from "../../../queries"
import { GroupMemberDetailsContext } from "./provider"

export default function GroupMemberDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string; memberId: string }> }>) {
  const { id: groupId, memberId } = use(params)
  const userId = decodeURIComponent(memberId)

  const { data: groupMember, isLoading, isError, error } = useGroupMemberGetQuery(groupId, userId)

  if (isLoading) {
    return null
  }

  if (isError || !groupMember) {
    return (
      <ResourceDetailError
        backHref={`/grupper/${groupId}/medlemmer`}
        title="Feil ved henting av gruppemedlem"
        message={error?.message ?? "Ukjent feil"}
      />
    )
  }

  return <GroupMemberDetailsContext.Provider value={{ groupMember }}>{children}</GroupMemberDetailsContext.Provider>
}
