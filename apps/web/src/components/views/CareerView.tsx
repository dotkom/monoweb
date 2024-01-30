import { useState, type FC } from "react"
import CompanyAdListItem from "../molecules/CompanyAdListItem"
import CompanyFiltersContainer from "../molecules/CompanyFiltersContainer"
import { type JobListing } from "@dotkomonline/types"

interface CareerProps {
  careers: JobListing[]
}

export interface EmploymentCheckbox {
  name: string
  checked: Boolean
}

const CareerView: FC<CareerProps> = (props: CareerProps) => {
  // return <div> 404 Siden finnes ikke </div>

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

  function filterName(jobListing: JobListing){
    console.log(jobListing.company.name, searchName.toLowerCase)
    return jobListing.company.name.toLowerCase().startsWith(searchName.toLowerCase())
  }
  // 1. hvis ingen er valgt, return true
  // 2. hvis en er valgt, sjekk om den er det samme som joblisting
  // 3. hvis flere er valgt, sjekk om minst en av dem er det samme som joblisting
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

  function sortDates(jobListing1: JobListing, jobListing2: JobListing){
    console.log(chosenSort)
    if (chosenSort === "Frist"){
      if (jobListing1.deadline?.getTime() == null){
        return -1
      }
      else if (jobListing2.deadline?.getTime() == null) {
        return 1
      }
      else{
        return jobListing1.deadline.getTime() - jobListing2.deadline.getTime();
      }
    }
    else if (chosenSort === "Påmeldingsstart"){
        return jobListing1.start.getTime() - jobListing2.start.getTime();
    }
    else if (chosenSort === "Slutt"){
      return jobListing1.end.getTime() - jobListing2.end.getTime();
    }
    return 0
  }

  return (
    <div>
      <div className="bg-amber-9 absolute left-0 top-[56px] z-0 h-[250px] w-full opacity-30" />
      <div className="absolute left-0 top-[56px] z-10 flex h-[250px] w-full flex-col justify-center">
        <div className="text-slate-3 m-auto h-[200px] max-w-[800px] p-5 text-center">
          <p className="leading-1.4 mt-5  text-4xl font-bold">
            Er du på jakt etter <span className="bg-amber-6 bg-center bg-no-repeat">jobb</span>?
          </p>
          <p className="leading-1.4 mt-7 text-2xl font-bold">
            Her har du en liste over bedrifter som er ute etter deg som informatikkstudent!
          </p>
        </div>
      </div>
      <div className="mb-10 mt-60 flex w-screen flex-row justify-center gap-x-5">
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
          <div className="border-slate-11 flex justify-between border-b-2">
            <p className="mb-2 w-1/4 text-xl font-medium">Bedrift</p>
            <p className="mb-2 w-[25%] text-xl font-medium">Rolle</p>
            <p className="mb-2 w-[17.5%] text-xl font-medium">Sted</p>
            <p className="mb-2 w-[17.5%] text-xl font-medium">Frist</p>
            <p className="mb-2 w-[15%] text-xl font-medium">Søknadslink</p>
          </div>
          <div className="flex flex-col">
            {props.careers
              .filter((jobListing) => {
                return filterLocation(jobListing) && filterEmployment(jobListing) && filterName(jobListing)
              }).sort((jobListing1,jobListing2) => {
                return sortDates(jobListing1,jobListing2);
              })
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

export default CareerView
