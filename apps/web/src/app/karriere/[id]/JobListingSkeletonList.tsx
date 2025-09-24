import { JobListingSkeleton } from "./JobListingSkeleton"

export const JobListingSkeletonList = () => (
  <div className="flex flex-col gap-6">
    <JobListingSkeleton />
    <JobListingSkeleton />
    <JobListingSkeleton />
    <JobListingSkeleton />
  </div>
)
