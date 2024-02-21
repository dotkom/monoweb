import JobListingView from "@/components/views/JobListingView/JobListingView"
import { trpc } from "@/utils/trpc"

const CareerPage = () => {
  const { data, isLoading } = trpc.jobListing.all.useQuery()
  if (isLoading) {
    return <p>Loading...</p>
  }
  return <JobListingView careers={data ?? []} />
}
export default CareerPage
