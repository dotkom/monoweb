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

export const useGroupMembersAllQuery = (groupId: GroupId) => {
  const trpc = useTRPC()
  const { data: members, ...query } = useQuery({
    ...trpc.group.getMembers.queryOptions(groupId),
    initialData: new Map(),
  })
  return { members, ...query }
}

export const useGroupMemberGetQuery = (groupId: GroupId, userId: UserId) => {
  const trpc = useTRPC()
  return useQuery(trpc.group.getMember.queryOptions({ groupId, userId }))
}
