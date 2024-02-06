import { trpc } from "../../../utils/trpc"

export const useJobListingAllLocationsQuery = () => {
  const { data: locations = [], ...query } = trpc.jobListing.getLocations.useQuery({ take: 999 })
  return { locations, ...query }
}
