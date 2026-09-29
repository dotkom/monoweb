"use client"

import { ResourceDetailError } from "@/components/ResourceDetailLayout/ResourceDetailError"
import { breadcrumbPath, useBreadcrumbLabel } from "@/lib/breadcrumb-context"
import { type PropsWithChildren, use } from "react"
import { useGroupMemberGetQuery } from "../../../queries"
import { GroupMemberDetailsContext } from "./provider"

export default function GroupMemberDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string; memberId: string }> }>) {
  const { id: rawGroupId, memberId } = use(params)
  const groupId = decodeURIComponent(rawGroupId)
  const userId = decodeURIComponent(memberId)

  const { data: groupMember, isLoading, isError, error } = useGroupMemberGetQuery(groupId, userId)

  const memberBreadcrumbLabel =
    groupMember?.name ?? groupMember?.email ?? (groupMember !== undefined ? "Ukjent bruker" : null)

  useBreadcrumbLabel(
    breadcrumbPath("grupper", groupId, "medlemmer", userId),
    memberBreadcrumbLabel,
    breadcrumbPath("grupper", groupId)
  )

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
