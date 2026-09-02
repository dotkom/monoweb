import { JobListingCardSkeleton } from "@/components/molecules/JobListingItem/JobListingCard"
import { JobListingListItemSkeleton } from "@/components/molecules/JobListingItem/JobListingListItem"

export type JobListingDisplayMode = "cards" | "list"

export const JobListingSkeletonList = ({ displayMode = "list" }: { displayMode?: JobListingDisplayMode }) => {
  if (displayMode === "cards") {
    return (
      <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        <JobListingCardSkeleton />
        <JobListingCardSkeleton />
        <JobListingCardSkeleton />
        <JobListingCardSkeleton />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <JobListingListItemSkeleton />
      <JobListingListItemSkeleton />
      <JobListingListItemSkeleton />
      <JobListingListItemSkeleton />
    </div>
  )
}
