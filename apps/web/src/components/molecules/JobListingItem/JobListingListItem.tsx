import type { JobListing } from "@dotkomonline/rpc/job-listing"
import { Text, Title, cn } from "@dotkomonline/ui"
import { IconClockHour3, IconHourglassLow, IconMapPin } from "@tabler/icons-react"
import { isPast } from "date-fns"
import Link from "next/link"
import type { FC } from "react"
import { formatJobListingDeadline, formatJobListingLocations, formatJobListingPublished } from "./jobListingFormatters"
import { JobListingImage } from "./JobListingImage"

export interface JobListingListItemProps {
  jobListing: JobListing
  className?: string
}

export const JobListingListItem: FC<JobListingListItemProps> = ({ jobListing, className }) => {
  const { id, title, company, employment, locations, featured, start } = jobListing
  const deadlinePassed = jobListing.deadline ? isPast(jobListing.deadline) : false

  return (
    <Link
      href={`/karriere/${id}`}
      className={cn(
        // [calc(100%+1rem)] is to offset the -mx-2
        "group flex flex-row gap-3 sm:gap-4 w-[calc(100%+1rem)] rounded-xl p-2 -mx-2 last:-mb-2",
        "hover:bg-gray-50 dark:hover:bg-stone-800 transition-colors",
        featured &&
          "border border-orange-200 bg-orange-100/80 hover:bg-orange-200/70 dark:border-orange-500/40 dark:bg-orange-900/10 dark:hover:bg-orange-900/20",
        className
      )}
    >
      <JobListingImage
        imageUrl={company.imageUrl}
        alt={company.name}
        employment={employment}
        featured={featured}
        className="w-max shrink-0"
        imageClassName="aspect-[16/9] h-26 sm:h-32"
        sizes="(min-width: 640px) 240px, 180px"
      />

      <div className="flex flex-col gap-3 min-w-0">
        <div className="flex flex-col min-w-0">
          <Title
            element="h3"
            size="sm"
            className="font-normal text-base md:text-lg line-clamp-1 sm:line-clamp-2 break-all"
          >
            {title}
          </Title>

          <Text className="text-sm font-medium text-gray-600 dark:text-stone-400">{company.name}</Text>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex flex-row gap-2 items-center text-xs md:text-sm dark:text-stone-300">
            <IconMapPin className="size-4 shrink-0 text-gray-800 dark:text-stone-400" />
            <Text>{formatJobListingLocations(locations)}</Text>
          </div>

          <div
            className={cn(
              "flex flex-row gap-2 items-center text-xs md:text-sm dark:text-stone-300",
              deadlinePassed && "text-gray-500 dark:text-stone-500"
            )}
          >
            <IconHourglassLow className="size-4 shrink-0 text-gray-800 dark:text-stone-400" />
            <Text>{formatJobListingDeadline(jobListing)}</Text>
          </div>

          <div className="flex flex-row gap-2 items-center text-xs md:text-sm dark:text-stone-300">
            <IconClockHour3 className="size-4 shrink-0 text-gray-800 dark:text-stone-400" />
            <Text>{formatJobListingPublished(start)}</Text>
          </div>
        </div>
      </div>
    </Link>
  )
}

export const JobListingListItemSkeleton: FC = () => {
  return (
    <div className="flex flex-row gap-4 w-full rounded-lg py-2">
      <div className="aspect-[16/9] h-26 sm:h-32 bg-gray-300 dark:bg-stone-600 rounded-lg animate-pulse" />

      <div className="flex flex-col gap-4 w-full">
        <div className="max-w-64 h-6 bg-gray-300 dark:bg-stone-600 rounded-sm animate-pulse" />

        <div className="flex gap-2">
          <div className="w-4 h-4 bg-gray-300 dark:bg-stone-600 rounded-sm animate-pulse" />
          <div className="w-28 h-4 bg-gray-300 dark:bg-stone-600 rounded-sm animate-pulse" />
        </div>

        <div className="flex gap-2">
          <div className="w-4 h-4 bg-gray-300 dark:bg-stone-600 rounded-sm animate-pulse" />
          <div className="w-32 h-4 bg-gray-300 dark:bg-stone-600 rounded-sm animate-pulse" />
        </div>
      </div>
    </div>
  )
}
