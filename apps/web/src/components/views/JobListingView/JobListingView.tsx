"use client"
import type { JobListing } from "@dotkomonline/types"
import { type FC, useState } from "react"
import CompanyAdListItem from "../../molecules/CompanyAdListItem"
import CompanyFiltersContainer from "../../molecules/CompanyFiltersContainer"
import { filterJobListings, sortDates } from "./JobListingFilterFunctions"

interface CareerProps {
  careers: JobListing[]
}

export interface EmploymentCheckbox {
  name: string
  checked: boolean
}

const getLocations = (jobListings: JobListing[]) => {
  const locations: string[] = []
  for (const jobListing of jobListings) {
    for (const location of jobListing.locations) {
      if (!locations.includes(location)) {
        locations.push(location)
      }
    }
  }

  return locations
}

const JobListingView: FC<CareerProps> = (props: CareerProps) => {
  const [chosenLocation, setChosenLocation] = useState<string>("Alle")
  const [searchName, setSearchName] = useState<string>("")
  const [chosenEmployments, setChosenEmployments] = useState<EmploymentCheckbox[]>([
    { name: "Deltid", checked: false },
    { name: "Fulltid", checked: false },
    { name: "Sommerjobb/internship", checked: false },
    { name: "Annet", checked: false },
  ])
  const [chosenSort, setChosenSort] = useState<string>("Frist")

  return (
    <div>
      <div className="border-slate-7 left-0 z-0 w-full border-b">
        <div className="flex flex-row gap-96 py-5">
          <div className="flex flex-col">
            <h2 className="mt-4 text-2xl font-bold border-b-0">Karrieremuligheter</h2>
            <p className="text-slate-9 pt-2">Ser du etter en jobb? Ta en titt på disse karrieremulighetene</p>
          </div>
        </div>
      </div>
      <div className="mb-10 mt-10 flex flex-row justify-center gap-x-12">
        <CompanyFiltersContainer
          chosenLocation={chosenLocation}
          setChosenLocation={setChosenLocation}
          searchName={searchName}
          setSearchName={setSearchName}
          chosenEmployments={chosenEmployments}
          setChosenEmployments={setChosenEmployments}
          chosenSort={chosenSort}
          setChosenSort={setChosenSort}
        />
        <div className="w-2/3">
          <div className="flex flex-col gap-6">
            {props.careers
              .filter((jobListing) =>
                filterJobListings(jobListing, chosenLocation, chosenEmployments, searchName, chosenSort)
              )
              .sort((jobListing1, jobListing2) => sortDates(jobListing1, jobListing2, chosenSort))
              .map((c) => (
                <div key={c.id}>
                  <CompanyAdListItem career={c} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobListingView
