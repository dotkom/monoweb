import { useTRPC } from "@/lib/trpc-client"
import type { JobListingFilterQuery } from "@dotkomonline/rpc/job-listing"
import type { Pageable } from "@dotkomonline/utils"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

interface UseJobListingAllProps {
  filter: JobListingFilterQuery
  page?: Pageable
}

export const useJobListingAllQuery = ({ filter, page }: UseJobListingAllProps) => {
  const trpc = useTRPC()
  const { data, ...query } = useInfiniteQuery({
    ...trpc.jobListing.findMany.infiniteQueryOptions({
      filter: {
        ...filter,
      },
      ...page,
    }),
    select: (data) => data.pages.flatMap((page) => page.items),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const jobListings = useMemo(() => data ?? [], [data])

  return { jobListings, ...query }
}

export const useJobListingAllLocationsQuery = () => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery({
    ...trpc.jobListing.getLocations.queryOptions(),
  })

  const locations = useMemo(() => data ?? [], [data])

  return { locations, ...query }
}
