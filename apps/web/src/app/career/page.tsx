import JobListingView from "@/components/views/JobListingView/JobListingView"
import { server } from "@/utils/trpc/server"

const CareerPage = async () => {
  const data = await server.jobListing.active.query()
  return <JobListingView jobListings={data ?? []} />
}
export default CareerPage
