import { useTRPC } from "@/utils/trpc/client"
import type { InterestGroupEventRouter } from "@dotkomonline/rpc"
import type { Group, GroupMembership } from "@dotkomonline/rpc/group"
import { keepPreviousData, skipToken, useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import type { InterestGroupEventsListQuery } from "./interest-group-event-list-query"

export type InterestGroupEventFindManyPage = InterestGroupEventRouter.FindManyInterestGroupEventsOutput

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
    ...trpc.group.allByType.queryOptions("INTEREST_GROUP"),
    initialData,
  })

  const interestGroups = data ?? []

  return {
    interestGroups,
    ...query,
  }
}

export const useInterestGroupEventsInfiniteQuery = (
  input: InterestGroupEventsListQuery,
  initialPage?: InterestGroupEventFindManyPage
) => {
  const trpc = useTRPC()
  const take = input.take

  const { data, ...query } = useInfiniteQuery({
    ...trpc.interestGroupEvent.findMany.infiniteQueryOptions(input),
    initialData:
      initialPage === undefined
        ? undefined
        : {
            pages: [initialPage],
            pageParams: [null],
          },
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage) => (lastPage.items.length < take ? undefined : lastPage.nextCursor),
  })

  const interestGroupEvents = useMemo(
    () => data?.pages.flatMap((interestGroupEventPage) => interestGroupEventPage.items) ?? [],
    [data]
  )

  return { interestGroupEvents, ...query }
}

export const useInterestGroupEventByIdQuery = (id: string | null) => {
  const trpc = useTRPC()

  return useQuery(trpc.interestGroupEvent.findById.queryOptions(id ?? skipToken))
}
