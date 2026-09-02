import type { JobListing } from "@dotkomonline/rpc/job-listing"
import { Text, Title, cn } from "@dotkomonline/ui"
import { IconClockHour3, IconHourglassLow, IconMapPin } from "@tabler/icons-react"
import { isPast } from "date-fns"
import Link from "next/link"
import type { FC } from "react"
import { formatJobListingDeadline, formatJobListingLocations, formatJobListingPublished } from "./jobListingFormatters"
import { JobListingImage } from "./JobListingImage"

export interface JobListingCardProps {
  jobListing: JobListing
  className?: string
}

export const JobListingCard: FC<JobListingCardProps> = ({ jobListing, className }) => {
  const { id, title, company, employment, locations, featured, start } = jobListing
  const deadlinePassed = jobListing.deadline ? isPast(jobListing.deadline) : false

  return (
    <Link
      href={`/karriere/${id}`}
      className={cn(
        "group flex flex-col w-full min-w-0 h-fit gap-3 p-3 rounded-2xl transition-colors",
        "border border-transparent hover:border-gray-200 dark:hover:border-stone-700 dark:hover:bg-stone-800/20",
        featured &&
          "border-orange-200 bg-orange-100/80 hover:border-orange-300 hover:bg-orange-200/70 dark:border-orange-500/40 dark:bg-orange-900/10 dark:hover:border-orange-500/50 dark:hover:bg-orange-900/20",
        className
      )}
    >
      <JobListingImage
        imageUrl={company.imageUrl}
        alt={company.name}
        employment={employment}
        featured={featured}
        className="w-full min-w-0"
        imageClassName="aspect-video w-full"
      />

      <div className="flex flex-col gap-3 w-full min-w-0">
        <div className="flex flex-col w-full min-w-0">
          <Title
            element="h3"
            size="lg"
            title={title}
            className="max-md:text-lg text-xl font-semibold line-clamp-2 wrap-break-word transition-colors"
          >
            {title}
          </Title>

          <Text className="text-sm font-medium text-gray-700 dark:text-stone-400">{company.name}</Text>
        </div>

        <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-2 w-full min-w-0">
          <div className="flex flex-row items-center gap-2 min-w-0">
            <IconHourglassLow className="size-4 shrink-0 dark:text-stone-400" />
            <Text className={cn("text-sm dark:text-stone-400", deadlinePassed && "text-gray-400 dark:text-stone-500")}>
              {formatJobListingDeadline(jobListing)}
            </Text>
          </div>

          <div className="flex flex-row items-center gap-2 min-w-0">
            <IconClockHour3 className="size-4 shrink-0 dark:text-stone-400" />
            <Text className="text-sm wrap-break-word dark:text-stone-400">{formatJobListingPublished(start)}</Text>
          </div>

          <div className="flex flex-row items-center gap-2 min-w-0">
            <IconMapPin className="size-4 shrink-0 dark:text-stone-400" />
            <Text className="text-sm wrap-break-word line-clamp-2 dark:text-stone-400">
              {formatJobListingLocations(locations)}
            </Text>
          </div>
        </div>
      </div>
    </Link>
  )
}

export const JobListingCardSkeleton: FC = () => {
  return (
    <div className="flex flex-col gap-3 p-3 rounded-2xl min-w-0 animate-pulse">
      <div className="aspect-video w-full bg-gray-300 dark:bg-stone-600 rounded-lg" />
      <div className="h-6 max-w-[85%] bg-gray-300 dark:bg-stone-600 rounded-sm" />
      <div className="h-4 max-w-[60%] bg-gray-300 dark:bg-stone-600 rounded-sm" />
    </div>
  )
}
