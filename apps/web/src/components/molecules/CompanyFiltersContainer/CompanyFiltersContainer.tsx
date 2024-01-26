import { FC, PropsWithChildren } from "react"
import { CompanyFilter, FilterGrid } from "../CompanyFilter/CompanyFilter"

export interface CompanyFiltersContainer {}

const jobTypes = ["Sommerjobb", "Fulltidsjobb", "Deltidsjobb", "Graduate"]
const places = ["Alle","Oslo", "Bergen", "Trondheim", "Annet"]
const sorter = ["Mine arrangementer", "Påmeldingsstart", "Frist"]

const CompanyFiltersContainer: FC<CompanyFiltersContainer> = (props: CompanyFiltersContainer) => {
  return (
    <div className="border-slate-8  w-72 rounded-lg border-[1px] shadow-sm">
      <div className="border-slate-8 flex flex-row justify-between border-b-[1px] py-4">
        <h4 className="mx-4 my-auto align-middle">Filter</h4>
      </div>
      <div className="mx-4">
        <p className="mt-2 font-semibold">Søk</p>
        <input
          className="border-slate-10 w-full rounded-md border-2 py-2 pl-2"
          type="text"
          placeholder="Søk jobbtittel eller nøkkelord"
        />
      </div>
      <CompanyFilter jobTypes={jobTypes} />
      <div className="border-slate-8 mb-4 border-b-[1px]">
        <div className="mx-4">
          <p className="mt-2 font-semibold">Sted</p>
          <select className="border-slate-8 radius my-2 mb-4 h-10 w-full rounded-md border-[1px]" name="places">
            {places.map((place, key) => {
              return <option key={key}>{place}</option>
            })}
          </select>
        </div>
      </div>
      <div>
        <div className="mx-4">
          <p className="mt-4 font-semibold">Sorter</p>
          <select className="border-slate-8 radius my-2 mb-4 h-10 w-full rounded-md border-[1px]" name="kategorier">
            {sorter.map((kategori, key) => {
              return <option key={key}>{kategori}</option>
            })}
          </select>
        </div>
      </div>
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
