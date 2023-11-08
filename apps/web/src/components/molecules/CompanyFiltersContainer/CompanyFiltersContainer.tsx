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
  <div className="shadow-md px-5 py-5 border-slate-9 border-2 rounded-xl">
      <h1 className="text-3xl">Filters</h1>
      <CompanyFilter filterContent={filterJobs}  />
      <button>
    <PlacesSelect></PlacesSelect>
      </button>
  </div>
  );

}
const PlacesSelect: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Select>
    <SelectTrigger >
      <SelectValue placeholder="placeholder"></SelectValue>
    </SelectTrigger>
  <SelectPortal>
    <SelectContent className="SelectContent">
      <SelectGroup>
        <SelectItem key="test" value="hei">test</SelectItem>
        <SelectItem key="test2" value="hei">test</SelectItem>
      </SelectGroup>
      <SelectItem value="SelectItem">
      </SelectItem>
    </SelectContent>
      </SelectPortal>
  </Select>
  )

}


export default CompanyFiltersContainer