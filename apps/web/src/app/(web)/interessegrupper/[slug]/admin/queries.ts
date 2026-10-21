import type { SidequestStatus } from "@dotkomonline/rpc/sidequest"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useTRPC } from "@/utils/trpc/client"

export const useSidequestsWithReview = (interestGroupId: string, status: SidequestStatus[]) => {
  const trpc = useTRPC()
  const { data, ...query } = useInfiniteQuery({
    ...trpc.sidequest.findManyWithRequestByInterestGroupId.infiniteQueryOptions({
      interestGroupId,
      filter: {
        byStatus: status,
      },
    }),
    select: (data) => data.pages.flatMap((page) => page.items),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const sidequestsWithReview = data ?? []

  return {
    sidequestsWithReview,
    ...query,
  }
}
