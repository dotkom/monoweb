import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/lib/trpc-client"

export const useJobListingAllLocationsQuery = () => {
  const trpc = useTRPC()
  const { data: locations, ...query } = useQuery({
    ...trpc.jobListing.getLocations.queryOptions(),
    initialData: [],
  })
  return { locations, ...query }
}
