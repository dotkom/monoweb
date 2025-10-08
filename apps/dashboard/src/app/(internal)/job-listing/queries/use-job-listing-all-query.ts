import { useTRPC } from "@/lib/trpc-client"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const useJobListingAllQuery = () => {
  const trpc = useTRPC()
  const { data: jobListings, ...query } = useInfiniteQuery({
    ...trpc.jobListing.findMany.infiniteQueryOptions(),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
  return { jobListings: useMemo(() => jobListings?.pages.flatMap((page) => page.items) ?? [], [jobListings]), ...query }
}
