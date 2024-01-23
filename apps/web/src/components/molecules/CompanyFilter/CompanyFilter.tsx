import { FC } from "react"

import { FilterItems } from "./filters"
export interface CompanyFilter {}

export const FilterGrid: FC<{ filters: string[] }> = (filters) => {
  return (
    <div>
      {filters.filters.map((content,index) => (
        <div key={index} className="flex-col rounded-md py-2 ">
        <input  className="mr-2 align-middle" type="checkbox"></input>
        <div className=" inline-block text-base">{content}</div>
      </div>
      ))}
    </div>
  )
}
//Shows the filter
export const CompanyFilter: FC<{ jobTypes: string[] }> = (jobtypes) => {
  return (
    <div>
        <div className="mx-4">
          <p className="mt-4 font-semibold">Jobbtyper</p>
          <div>
            <FilterGrid filters={jobtypes.jobTypes} />
          </div>
        </div>
      <div className="border-slate-11 border-b-[1px]" />
    </div>
  )
}
