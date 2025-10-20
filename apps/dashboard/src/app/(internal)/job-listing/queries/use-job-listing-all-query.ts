import { useTRPC } from "@/lib/trpc-client"
import type { JobListingFilterQuery } from "@dotkomonline/types"
import { useInfiniteQuery } from "@tanstack/react-query"
import type { Pageable } from "node_modules/@dotkomonline/rpc/src/query"
import { useMemo } from "react"

interface UseJobListingAllProps {
  filter: JobListingFilterQuery
  page?: Pageable
}

export const useJobListingAllQuery = ({ filter, page }: UseJobListingAllProps) => {
  const trpc = useTRPC()
  const { data: jobListings, ...query } = useInfiniteQuery({
    ...trpc.jobListing.findMany.infiniteQueryOptions({
      filter: {
        ...filter,
      },
      ...page,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
  return { jobListings: useMemo(() => jobListings?.pages.flatMap((page) => page.items) ?? [], [jobListings]), ...query }
}
