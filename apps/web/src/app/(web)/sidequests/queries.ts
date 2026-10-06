import { useTRPC } from "@/utils/trpc/client"
import type { SidequestRouter } from "@dotkomonline/rpc"
import { GroupTypeSchema, type Group, type GroupMembership } from "@dotkomonline/rpc/group"
import { keepPreviousData, skipToken, useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import type { SidequestsListQuery } from "./sidequest-list-query"

export type SidequestFindManyPage = SidequestRouter.FindManySidequestsOutput

export const useCurrentUserGroupMembershipsQuery = (userId: string | undefined, initialData: GroupMembership[]) => {
  const trpc = useTRPC()

  const { data, ...query } = useQuery({
    ...trpc.group.allMembershipsByUserId.queryOptions(userId ?? skipToken),
    initialData,
  })

  return {
    memberships: data ?? [],
    ...query,
  }
}

export const useInterestGroupsQuery = (initialData?: Group[]) => {
  const trpc = useTRPC()

  const { data, ...query } = useQuery({
    ...trpc.group.allByType.queryOptions(GroupTypeSchema.enum.INTEREST_GROUP),
    initialData,
  })

  const interestGroups = data ?? []

  return {
    interestGroups,
    ...query,
  }
}

export const useSidequestsInfiniteQuery = (
  input: SidequestsListQuery,
  initialPage?: SidequestFindManyPage,
  options?: { enabled?: boolean }
) => {
  const trpc = useTRPC()
  const take = input.take
  const enabled = options?.enabled ?? true
  const shouldUseInitialPage = enabled && initialPage !== undefined

  const { data, ...query } = useInfiniteQuery({
    ...trpc.sidequest.findMany.infiniteQueryOptions(input),
    enabled,
    initialData: shouldUseInitialPage
      ? {
          pages: [initialPage],
          pageParams: [null],
        }
      : undefined,
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage) => (lastPage.items.length < take ? undefined : lastPage.nextCursor),
  })

  const sidequests = useMemo(() => data?.pages.flatMap((sidequestPage) => sidequestPage.items) ?? [], [data])

  return { sidequests, ...query }
}

export const useSidequestByIdQuery = (id: string | null) => {
  const trpc = useTRPC()

  return useQuery(trpc.sidequest.findById.queryOptions(id ?? skipToken))
}
