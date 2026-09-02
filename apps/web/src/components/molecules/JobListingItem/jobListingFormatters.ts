import type { JobListing, JobListingLocation } from "@dotkomonline/rpc/job-listing"
import { formatDistanceToNowStrict } from "date-fns"
import { nb } from "date-fns/locale"

export const formatJobListingLocations = (locations: Pick<JobListingLocation, "name">[]) => {
  if (locations.length === 0) {
    return "Ikke oppgitt"
  }

  return locations.map((location) => location.name).join(", ")
}

export const formatJobListingPublished = (start: Date) =>
  `Lagt ut for ${formatDistanceToNowStrict(start, { locale: nb, addSuffix: true })}`

export const formatJobListingDeadline = (jobListing: JobListing) => {
  if (jobListing.rollingAdmission) {
    return "Frist fortløpende"
  }

  if (!jobListing.deadline) {
    return "Ingen frist"
  }

  return `Frist: ${jobListing.deadline.toLocaleDateString("no-NO", { day: "2-digit", month: "short", year: "numeric" })}`
}
