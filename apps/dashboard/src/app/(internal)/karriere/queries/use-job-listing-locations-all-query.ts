import { useTRPC } from "@/lib/trpc-client"

import { useQuery } from "@tanstack/react-query"

export const useJobListingAllLocationsQuery = () => {
  const trpc = useTRPC()
  const { data: locations, ...query } = useQuery({
    ...trpc.jobListing.getLocations.queryOptions(),
    initialData: [],
  })
  return { locations, ...query }
}
