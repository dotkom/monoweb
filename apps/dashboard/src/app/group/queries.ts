import { useTRPC } from "@/lib/trpc"
import type { GroupId, UserId } from "@dotkomonline/types"

import { useQuery } from "@tanstack/react-query"

export const useGroupAllQuery = () => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(trpc.group.all.queryOptions())
  if (data === undefined || query.isLoading) {
    return { groups: [], ...query }
  }
  return { groups: data, ...query }
}

export const useGroupGetQuery = (id: GroupId) => {
  const trpc = useTRPC()
  return useQuery(trpc.group.get.queryOptions(id))
}

export const useGroupMembersAllQuery = (groupId: GroupId) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(trpc.group.getMembers.queryOptions(groupId))
  if (data === undefined || query.isLoading) {
    return { members: null, ...query }
  }
  return { members: data, ...query }
}

export const useGroupMemberGetQuery = (groupId: GroupId, userId: UserId) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(trpc.group.getMember.queryOptions({ groupId, userId }))
  if (data === undefined || query.isLoading) {
    return { member: null, ...query }
  }
  return { member: data, ...query }
}
