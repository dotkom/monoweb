import type { JobListingEmployment } from "@dotkomonline/rpc/job-listing"
import type { BadgeColor } from "@dotkomonline/ui"

export const JOB_LISTING_EMPLOYMENT_CONFIG = {
  FULLTIME: {
    label: "Heltid",
    backgroundColor: "red",
  },
  PARTTIME: {
    label: "Deltid",
    backgroundColor: "blue",
  },
  SUMMER_INTERNSHIP: {
    label: "Sommerjobb",
    backgroundColor: "green",
  },
  OTHER: {
    label: "Annet",
    backgroundColor: "gray",
  },
} as const satisfies Record<JobListingEmployment, { label: string; backgroundColor: BadgeColor }>
