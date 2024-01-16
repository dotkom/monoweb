import { FC, PropsWithChildren } from "react"
import {CompanyFilter} from "../CompanyFilter/CompanyFilter"
import {FilterItems} from "../CompanyFilter/filters"
import { Select, SelectContent, SelectGroup, SelectItem, SelectValue, SelectPortal, SelectTrigger } from "@dotkomonline/ui"

export interface CompanyFiltersContainer {

}

const filterJobs: FilterItems[] = [
  {
    title: "Jobbtyper",
    items: [
        "Sommerjobb" ,
        "Fulltidsjobb",
        "Deltidsjobb",
        "Graduate",
    ],
  },
]
const places = [
      "Oslo",
      "Bergen",
      "Trondheim",
      "Annet"
    ]

const CompanyFiltersContainer: FC<CompanyFiltersContainer> = (props:CompanyFiltersContainer) =>{
  return (
  <div className="shadow-md border-slate-9 border-2 rounded-lg">
      <div className="border-b-2 py-4 border-slate-10 flex justify-between flex-row">
      <h4 className="mx-4 my-auto align-middle">Filter</h4>
      <button className="mx-4 my-auto font-semibold text-red-9">Reset</button>
      </div>
      <CompanyFilter filterContent={filterJobs}  />
  </div>
  );

}

export default CompanyFiltersContainer