import { useTRPC } from "../../../trpc"

import { useQuery } from "@tanstack/react-query"

export const useJobListingAllLocationsQuery = () => {
  const trpc = useTRPC()
  const { data: locations, ...query } = useQuery(
    trpc.jobListing.getLocations.queryOptions({ take: 999 }, { initialData: [] as string[] })
  )
  return { locations, ...query }
}
