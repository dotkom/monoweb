import { EmploymentCheckbox } from "@/components/views/CareerView"
import { Dispatch, FC, PropsWithChildren, SetStateAction } from "react"

interface CompanyFiltersContainer {
  chosenLocation: string
  setChosenLocation: Dispatch<SetStateAction<string>>
  chosenEmployments: EmploymentCheckbox[]
  setChosenEmployments: Dispatch<SetStateAction<EmploymentCheckbox[]>>
}

const places = ["Alle", "Oslo", "Bergen", "Trondheim", "Annet"]
const sorter = ["Frist", "Påmeldingsstart", "Opprettelse"]

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
      <div>
        <div className="mx-4">
          <p className="mt-6 font-semibold">Jobbtyper</p>
          <div>
            {props.chosenEmployments.map((content, index) => (
              <div key={index} className="flex-col rounded-md py-2 ">
                <input
                  className="accent-blue-12 mr-2 align-middle"
                  type="checkbox"
                  onChange={(e) => {
                    content.checked = e.target.checked
                    props.setChosenEmployments([...props.chosenEmployments])
                  }}
                ></input>
                <div className=" inline-block text-base">{content.name}</div>
              </div>
            ))}
          </div>
        </div>
        <div />
      </div>
      <div className="border-slate-8 mb-4 border-b-[1px]">
        <div className="mx-4">
          <p className="mt-2 font-semibold">Sted</p>
          <select
            value={props.chosenLocation}
            onChange={(e) => props.setChosenLocation(e.target.value)}
            className="border-slate-8 radius my-2 mb-4 h-10 w-full rounded-md border-[1px]"
            name="places"
          >
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

export default CompanyFiltersContainer
