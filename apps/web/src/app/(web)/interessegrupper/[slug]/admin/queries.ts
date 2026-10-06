import { useTRPC } from "@/utils/trpc/client"
import type { SidequestStatus } from "@dotkomonline/rpc/sidequest"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const useSidequestsWithReview = (interestGroupId: string, status: SidequestStatus[]) => {
  const trpc = useTRPC()
  const { data, ...query } = useInfiniteQuery({
    ...trpc.sidequest.findManyWithRequest.infiniteQueryOptions({
      filter: {
        byStatus: status,
        byInterestGroupId: [interestGroupId],
      },
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const sidequestsWithReview = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])

  return {
    sidequestsWithReview,
    ...query,
  }
}
