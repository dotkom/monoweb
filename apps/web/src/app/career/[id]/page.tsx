import { JobListingView } from "@/components/views/JobListingView"
import { server } from "@/utils/trpc/server"
import { notFound } from "next/navigation"

interface JobListingProps {
  params: {
    id: string
  }
}

const JobListingPage = async ({ params: { id } }: JobListingProps) => {
  const data = await server.jobListing.get.query(id)
  if (!data) {
    return notFound()
  }
  return <JobListingView jobListing={data} />
}

export default JobListingPage
