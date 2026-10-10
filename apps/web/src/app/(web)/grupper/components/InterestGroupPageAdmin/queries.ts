import type { InterestGroupEventStatus } from "@dotkomonline/rpc/interest-group-event"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useTRPC } from "src/utils/trpc/client"

export const useInterestGroupEventsWithReview = (interestGroupId: string, status: InterestGroupEventStatus[]) => {
  const trpc = useTRPC()
  const { data, ...query } = useInfiniteQuery({
    ...trpc.interestGroupEvent.findManyWithRequestByInterestGroupId.infiniteQueryOptions({
      interestGroupId,
      filter: {
        byStatus: status,
      },
    }),
    select: (data) => data.pages.flatMap((page) => page.items),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const eventsWithReview = data ?? []

  return {
    eventsWithReview,
    ...query,
  }
}
