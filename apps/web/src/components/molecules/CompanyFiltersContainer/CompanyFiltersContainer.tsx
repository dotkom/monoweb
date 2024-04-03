import { FC, PropsWithChildren } from "react"
import { CompanyFilter } from "../CompanyFilter/CompanyFilter"
import { FilterItems } from "../CompanyFilter/filters"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
  SelectPortal,
  SelectTrigger,
} from "@dotkomonline/ui"

export interface CompanyFiltersContainer {}

const filterJobs: FilterItems[] = [
  {
    title: "Jobbtyper",
    items: ["Sommerjobb", "Fulltidsjobb", "Deltidsjobb", "Graduate"],
  },
]
const places = ["Oslo", "Bergen", "Trondheim", "Annet"]

const CompanyFiltersContainer: FC<CompanyFiltersContainer> = (props: CompanyFiltersContainer) => {
  return (
    <div className="border-slate-9 w-72 rounded-lg border-2 shadow-md">
      <div className="border-slate-10 flex flex-row justify-between border-b-2 py-4">
        <h4 className="mx-4 my-auto align-middle">Filter</h4>
        <button className="text-red-9 mx-4 my-auto font-semibold">Reset</button>
      </div>
      <CompanyFilter filterContent={filterJobs} />
      <select name="places" id="">
        {places.map((place, key) => {
          return <option key={key}>{place}</option>
        })}
      </select>
    </div>
  )
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
