"use client"
import type { SortOption } from "@/components/molecules/CompanyFiltersContainer/CompanyFiltersContainer"
import type { JobListing } from "@dotkomonline/types"
import { type FC, useMemo, useState } from "react"
import CompanyAdListItem from "../../molecules/CompanyAdListItem"
import CompanyFiltersContainer from "../../molecules/CompanyFiltersContainer"
import { filterJobListings, sortDates } from "./JobListingFilterFunctions"

interface JoblistingProps {
  jobListings: JobListing[]
}

const employmentType = ["Deltid", "Fulltid", "Sommerjobb/internship", "Annet"] as const
export type EmploymentType = (typeof employmentType)[number]
export interface EmploymentCheckbox {
  name: EmploymentType
  checked: boolean
}

const getLocations = (jobListings: JobListing[]) => {
  const locations = new Set<string>()
  for (const jobListing of jobListings) {
    for (const location of jobListing.locations) {
      locations.add(location)
    }
  }

  return Array.from(locations)
}

const JobListingView: FC<JoblistingProps> = (props: JoblistingProps) => {
  const [chosenLocation, setChosenLocation] = useState<string>("Alle")
  const [searchName, setSearchName] = useState<string>("")
  const [chosenEmployments, setChosenEmployments] = useState<EmploymentCheckbox[]>([
    { name: "Deltid", checked: false },
    { name: "Fulltid", checked: false },
    { name: "Sommerjobb/internship", checked: false },
    { name: "Annet", checked: false },
  ])
  const [chosenSort, setChosenSort] = useState<SortOption>("Frist")

  const filteredJobListings = useMemo(
    () =>
      props.jobListings
        .filter((jobListing) =>
          filterJobListings(jobListing, chosenLocation, chosenEmployments, searchName, chosenSort)
        )
        .sort((jobListing1, jobListing2) => sortDates(jobListing1, jobListing2, chosenSort)),
    [props.jobListings, chosenLocation, chosenEmployments, searchName, chosenSort]
  )

  return (
    <div>
      <div className="border-slate-7 left-0 z-0 w-full border-b">
        <div className="flex flex-row gap-96 py-5">
          <div className="flex flex-col">
            <p className="mt-4 text-3xl font-bold border-b-0">Karrieremuligheter</p>
            <p className="text-slate-9 pt-2">Ser du etter en jobb? Ta en titt på disse karrieremulighetene</p>
          </div>
        </div>
      </div>
      <div className="mb-10 mt-10 flex flex-row gap-x-12">
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

export default JobListingView
