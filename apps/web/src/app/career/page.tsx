import JobListingView from "@/components/views/JobListingView/JobListingView"
import { getServerClient } from "@/utils/trpc/serverClient"
type CareerSearchParams = {
  [key: string]: string
}

const CareerPage = async () => {
  const serverClient = await getServerClient()
  const data = await serverClient.jobListing.all()
  return <JobListingView careers={data ?? []} />
}
export default CareerPage
