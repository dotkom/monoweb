"use client"

import type { SortOption } from "@/components/molecules/CompanyFiltersContainer/CompanyFiltersContainer"
import type { JobListing } from "@dotkomonline/types"
import { type FC, useMemo, useState } from "react"
import { CompanyAdListItem } from "../../molecules/CompanyAdListItem/CompanyAdListItem"
import { CompanyFiltersContainer } from "../../molecules/CompanyFiltersContainer/CompanyFiltersContainer"
import { filterJobListings, sortDates } from "./JobListingFilterFunctions"

interface JoblistingProps {
  jobListings: JobListing[]
}

const employmentType = ["PARTTIME", "FULLTIME", "SUMMER_INTERNSHIP", "OTHER"] as const
export type EmploymentType = (typeof employmentType)[number]
export interface EmploymentCheckbox {
  name: EmploymentType
  checked: boolean
}

const getLocations = (jobListings: JobListing[]) => {
  const locations = new Set<string>()
  for (const jobListing of jobListings) {
    for (const location of jobListing.locations) {
      locations.add(location.name)
    }
  }

  return Array.from(locations)
}

export const JobListingView: FC<JoblistingProps> = (props: JoblistingProps) => {
  const [chosenLocation, setChosenLocation] = useState<string>("Alle")
  const [searchName, setSearchName] = useState<string>("")
  const [chosenEmployments, setChosenEmployments] = useState<EmploymentCheckbox[]>([
    { name: "PARTTIME", checked: false },
    { name: "FULLTIME", checked: false },
    { name: "SUMMER_INTERNSHIP", checked: false },
    { name: "OTHER", checked: false },
  ])
  const [chosenSort, setChosenSort] = useState<SortOption>("Frist")

  const filteredJobListings = useMemo(
    () =>
      props.jobListings
        .filter((jobListing) =>
          filterJobListings(jobListing, chosenLocation, chosenEmployments, searchName, chosenSort)
        )
        .sort((jobListing1, jobListing2) => sortDates(jobListing1, jobListing2, chosenSort))
        .sort((jobListing1, jobListing2) => {
          if (jobListing1.featured && !jobListing2.featured) return -1
          if (!jobListing1.featured && jobListing2.featured) return 1
          return 0
        }),
    [props.jobListings, chosenLocation, chosenEmployments, searchName, chosenSort]
  )

  return (
    <div>
      <div className="border-gray-600 left-0 z-0 w-full border-b">
        <div className="flex flex-row gap-96">
          <div className="flex flex-col gap-2">
            <p className="text-3xl font-bold border-b-0">Karrieremuligheter</p>
            <p className="text-gray-800">Ser du etter en jobb? Ta en titt på disse karrieremulighetene</p>
          </div>
        </div>
      </div>
      <div className="mb-10 mt-10 flex flex-col xl:flex-row gap-x-12">
        <CompanyFiltersContainer
          chosenLocation={chosenLocation}
          setChosenLocation={setChosenLocation}
          searchName={searchName}
          setSearchName={setSearchName}
          chosenEmployments={chosenEmployments}
          setChosenEmployments={setChosenEmployments}
          chosenSort={chosenSort}
          setChosenSort={setChosenSort}
          places={getLocations(props.jobListings)}
        />
        <div className="flex-1">
          <div className="flex flex-col gap-6">
            {filteredJobListings.map((c) => (
              <div key={c.id}>
                <CompanyAdListItem jobListing={c} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
