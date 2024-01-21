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

const jobTypes = ["Sommerjobb", "Fulltidsjobb", "Deltidsjobb", "Graduate"]
const places = ["Oslo", "Bergen", "Trondheim", "Annet"]

const CompanyFiltersContainer: FC<CompanyFiltersContainer> = (props: CompanyFiltersContainer) => {
  return (
    <div className="border-slate-9 border-[1px] w-72 rounded-lg shadow-md">
      <div className="border-slate-10 flex flex-row justify-between border-b-[1px] py-4">
        <h4 className="mx-4 my-auto align-middle">Filter</h4>
        <button className="text-red-9 mx-4 my-auto font-semibold">Reset</button>
      </div>
      <CompanyFilter jobTypes={jobTypes} />
      <div className="border-slate-10 mx-4 mb-4 border-b-[1px]">
        <p className=" mt-4 font-semibold ">Sted</p>
        <select className="border-slate-10 radius h-10 w-full rounded-md border-[1px]" name="places">
          {places.map((place, key) => {
            return <option key={key}>{place}</option>
          })}
        </select>
      </div>
    </div>
  )
}

export default CompanyFiltersContainer
