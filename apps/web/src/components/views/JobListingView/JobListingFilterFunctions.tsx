import type { JobListing } from "@dotkomonline/types"
import type { EmploymentCheckbox } from "./JobListingView"
export function filterJobListings(
  jobListing: JobListing,
  chosenLocation: string,
  chosenEmployments: EmploymentCheckbox[],
  searchName: string,
  chosenSort: string
) {
  return (
    filterLocation(jobListing, chosenLocation) &&
    filterEmployment(jobListing, chosenEmployments) &&
    filterName(jobListing, searchName)
  )
}

export function filterLocation(jobListing: JobListing, chosenLocation: string) {
  if (chosenLocation === "Alle") {
    return true
  }
  return jobListing.locations.includes(chosenLocation)
}

export function filterName(jobListing: JobListing, searchName: string) {
  return jobListing.company.name.toLowerCase().startsWith(searchName.toLowerCase())
}

export function filterEmployment(jobListing: JobListing, chosenEmployments: EmploymentCheckbox[]) {
  if (chosenEmployments.every((employment) => !employment.checked)) {
    return true
  }
  return chosenEmployments.some((employment) => {
    if (employment.checked && jobListing.employment == employment.name) {
      return true
    }
    return false
  })
}

export function sortDates(jobListing1: JobListing, jobListing2: JobListing, chosenSort: string) {
  if (chosenSort === "Frist") {
    if (jobListing1.deadline?.getTime() == null) {
      return -1
    } else if (jobListing2.deadline?.getTime() == null) {
      return 1
    }
    return jobListing1.deadline.getTime() - jobListing2.deadline.getTime()
  } else if (chosenSort === "Påmeldingsstart") {
    return jobListing1.start.getTime() - jobListing2.start.getTime()
  } else if (chosenSort === "Slutt") {
    return jobListing1.end.getTime() - jobListing2.end.getTime()
  }
  return 0
}
