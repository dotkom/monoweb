import type { SortOption } from "@/components/molecules/CompanyFiltersContainer/CompanyFiltersContainer"
import type { JobListing } from "@dotkomonline/types"
import type { EmploymentCheckbox } from "./JobListingView"
export function filterJobListings(
  jobListing: JobListing,
  chosenLocation: string,
  chosenEmployments: EmploymentCheckbox[],
  searchName: string,
  chosenSort: SortOption
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
    if (employment.checked && jobListing.employment === employment.name) {
      return true
    }
    return false
  })
}

export function sortDates(jobListing1: JobListing, jobListing2: JobListing, chosenSort: SortOption) {
  if (chosenSort === "Frist") {
    if (jobListing1.deadline?.getTime() == null) {
      return -1
    }
    if (jobListing2.deadline?.getTime() == null) {
      return 1
    }
    return jobListing1.deadline.getTime() - jobListing2.deadline.getTime()
  }
  if (chosenSort === "Opprettet") {
    return jobListing1.createdAt.getTime() - jobListing2.createdAt.getTime()
  }
  return 0
}
