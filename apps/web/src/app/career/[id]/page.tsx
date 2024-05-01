import { getServerClient } from "@/utils/trpc/serverClient"
import { notFound } from "next/navigation"
import { JobListingView } from "../../../components/views/JobListingView"

interface JobListingProps {
  params: {
    id: string
  }
}

const JobListingPage = async ({ params: { id } }: JobListingProps) => {
  const serverClient = await getServerClient()
  const data = await serverClient.jobListing.get(id)
  if (!data) {
    return notFound()
  }
  return <JobListingView jobListing={data} />
}

export default JobListingPage
