import { FC } from "react"

import { FilterItems } from "./filters"
export interface CompanyFilter {}

const Filter: FC<{ name: string }> = (name) => {
  return (
    <div className="flex-col rounded-md py-2 ">
      <input className="mr-2 align-middle" type="checkbox"></input>
      <div className=" inline-block text-base">{name.name}</div>
    </div>
  )
}
const FilterGrid: FC<{ filters: string[] }> = (filters) => {
  return (
    <div>
      {filters.filters.map((content) => (
        <Filter name={content} />
      ))}
    </div>
  )
}
export const CompanyFilter: FC<{ filterContent: FilterItems[] }> = (filterContent) => {
  return (
    <div>
      {filterContent.filterContent.map((content) => (
        <div className="mx-4">
          <p className="mt-4 font-semibold">{content.title}</p>
          <div>
            <FilterGrid filters={content.items} />
          </div>
        </div>
      ))}
      <div className="border-slate-10 border-b-2" />
    </div>
  )
}
