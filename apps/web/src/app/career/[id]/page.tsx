import { JobListingView } from "@/components/views/JobListingView"
import { server } from "@/utils/trpc/server"
import { notFound } from "next/navigation"

interface JobListingProps {
  params: Promise<{
    id: string
  }>
}

const JobListingPage = async ({ params }: JobListingProps) => {
  const { id } = await params
  const data = await server.jobListing.get.query(id)
  if (!data) {
    return notFound()
  }
  return <JobListingView jobListing={data} />
}

export default JobListingPage
