import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "../../../trpc"

export const useJobListingAllQuery = () => {
  const trpc = useTRPC()
  const { data: jobListings, ...query } = useQuery({
    ...trpc.jobListing.all.queryOptions({ take: 999 }),
    initialData: [],
  })
  return { jobListings, ...query }
}
