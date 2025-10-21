import { useTRPC } from "@/lib/trpc-client"
import type { GroupId, UserId } from "@dotkomonline/types"

import { useQuery } from "@tanstack/react-query"

export const useGroupAllQuery = () => {
  const trpc = useTRPC()
  const { data: groups, ...query } = useQuery({
    ...trpc.group.all.queryOptions(),
    initialData: [],
  })
  return { groups, ...query }
}

export const useGroupGetQuery = (id: GroupId) => {
  const trpc = useTRPC()
  return useQuery(trpc.group.get.queryOptions(id))
}

export const useGroupMembersAllQuery = (groupId: GroupId, enabled = true) => {
  const trpc = useTRPC()
  const { data: members, ...query } = useQuery({
    ...trpc.group.getMembers.queryOptions(groupId),
    initialData: new Map(),
    enabled,
  })
  return { members, ...query }
}

export const useGroupMemberGetQuery = (groupId: GroupId, userId: UserId) => {
  const trpc = useTRPC()
  return useQuery(trpc.group.getMember.queryOptions({ groupId, userId }))
}

export const useWorkspaceMembersAllQuery = (groupSlug: GroupId, enabled = true) => {
  const trpc = useTRPC()
  const { data: members, ...query } = useQuery(
    trpc.workspace.getMembersForGroup.queryOptions({ groupSlug }, { enabled })
  )
  return { members, ...query }
}

export const useFindWorkspaceGroupQuery = (groupSlug: GroupId, customKey?: string, enabled = true) => {
  const trpc = useTRPC()
  const {
    data: workspaceGroup,
    isLoading,
    error,
  } = useQuery(trpc.workspace.findGroup.queryOptions({ groupSlug, customKey }, { enabled }))
  return { workspaceGroup, isLoading, error }
}
