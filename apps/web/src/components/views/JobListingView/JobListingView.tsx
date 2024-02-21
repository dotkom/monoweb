import { useState, type FC } from "react"
import { type JobListing } from "@dotkomonline/types"
import CompanyAdListItem from "../../molecules/CompanyAdListItem"
import CompanyFiltersContainer from "../../molecules/CompanyFiltersContainer"
import OnlineIcon from "../../atoms/OnlineIcon"

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

  function filterLocation(jobListing: JobListing) {
    if (chosenLocation === "Alle") {
      return true
    }
    return jobListing.locations.includes(chosenLocation)
  }

  function filterName(jobListing: JobListing) {
    return jobListing.company.name.toLowerCase().startsWith(searchName.toLowerCase())
  }
  
  function filterEmployment(jobListing: JobListing) {
    // check if no employment object has checked === true
    if (chosenEmployments.every((employment) => !employment.checked)) {
      return true
    }
    // check if employment is checked
    return chosenEmployments.some((employment) => {
      if (employment.checked && jobListing.employment == employment.name) {
        return true
      }
      return false
    })
  }

  function sortDates(jobListing1: JobListing, jobListing2: JobListing) {
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
                (jobListing) => filterLocation(jobListing) && filterEmployment(jobListing) && filterName(jobListing)
              )
              .sort((jobListing1, jobListing2) => sortDates(jobListing1, jobListing2))
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
