import { trpc } from "../../../trpc"

export const useJobListingAllQuery = () => {
  const { data: jobListings = [], ...query } = trpc.jobListing.all.useQuery({ take: 999 })
  return { jobListings, ...query }
}
