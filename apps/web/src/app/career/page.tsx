"use client"

import JobListingView from "@/components/views/JobListingView/JobListingView"
import { trpc } from "../../utils/trpc/client"

const CareerPage = () => {
  const { data, isLoading } = trpc.jobListing.all.useQuery()
  if (isLoading) {
    return <p>Loading...</p>
  }
  return <JobListingView careers={data ?? []} />
}
export default CareerPage
