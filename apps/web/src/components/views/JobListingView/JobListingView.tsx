import { useState, type FC } from "react"
import { type JobListing } from "@dotkomonline/types"
import CompanyAdListItem from "../../molecules/CompanyAdListItem"
import CompanyFiltersContainer from "../../molecules/CompanyFiltersContainer"
import OnlineIcon from "../../atoms/OnlineIcon"
import { filterJobListings, sortDates } from "./JobListingFilterFunctions"

interface CareerProps {
  careers: JobListing[]
}

export interface EmploymentCheckbox {
  name: string
  checked: boolean
}

const JobListingView: FC<CareerProps> = (props: CareerProps) => {
  const [chosenLocation, setChosenLocation] = useState<string>("Alle")
  const [searchName, setSearchName] = useState<string>("")
  const [chosenEmployments, setChosenEmployments] = useState<EmploymentCheckbox[]>([
    { name: "Deltid", checked: false },
    { name: "Fulltid", checked: false },
    { name: "Sommerjobb/internship", checked: false },
  ])
  const [chosenSort, setChosenSort] = useState<string>("Frist")



  return (
    <div>
      <div className="border-slate-7 left-0 z-0 w-full border-b shadow-sm">
        <div className="flex flex-row justify-evenly gap-96 p-5">
          <div className="flex flex-col">
            <h2 className="mt-4 border-b-0">Karrieremuligheter</h2>
            <p className="text-slate-9 pt-2">Ser du etter en jobb? Ta en titt på disse karrieremulighetene</p>
          </div>
          <OnlineIcon className="float-right h-16 w-16"></OnlineIcon>
        </div>
      </div>
      <div className="mb-10 mt-10 flex w-screen flex-row justify-center gap-x-5">
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
        <div className="w-1/2">
          <div className="flex flex-col gap-6">
            {props.careers
              .filter(
                (jobListing => filterJobListings(jobListing, chosenLocation, chosenEmployments, searchName, chosenSort))
              )
              .sort((jobListing1, jobListing2) => sortDates(jobListing1, jobListing2, chosenSort))
              .map((c, key) => (
                <div key={key}>
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
