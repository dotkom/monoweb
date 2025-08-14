import type { Dispatch, FC, SetStateAction } from "react"
import type { EmploymentCheckbox } from "./page"

interface CompanyFiltersContainer {
  chosenLocation: string
  setChosenLocation: Dispatch<SetStateAction<string>>
  searchName: string
  setSearchName: Dispatch<SetStateAction<string>>
  chosenEmployments: EmploymentCheckbox[]
  setChosenEmployments: Dispatch<SetStateAction<EmploymentCheckbox[]>>
  chosenSort: string
  setChosenSort: Dispatch<SetStateAction<SortOption>>
  places: string[]
}
const sortOption = ["Frist", "Opprettet"] as const
export type SortOption = (typeof sortOption)[number]

export const translationJobTypes = {
  PARTTIME: "Deltid",
  FULLTIME: "Heltid",
  SUMMER_INTERNSHIP: "Sommerjobb",
  OTHER: "Annet",
}

export const CompanyFiltersContainer: FC<CompanyFiltersContainer> = (props: CompanyFiltersContainer) => (
  <div className="border-gray-200 h-fit xl:w-72 rounded-lg border shadow-b-sm">
    <div className="border-gray-200 flex flex-row justify-between border-b py-4">
      <h4 className="mx-4 my-auto text-lg align-middle">Filter</h4>
    </div>
    <div className="mx-4">
      <p className="mt-4 font-semibold">Søk</p>
      <input
        onChange={(e) => {
          props.setSearchName(e.target.value)
        }}
        className="border-gray-700 w-full rounded-md border-2 py-2 pl-2"
        type="text"
        placeholder="Søk jobbtittel eller nøkkelord"
      />
    </div>
    <div>
      <div className="mx-4">
        <p className="mt-4 font-semibold">Jobbtyper</p>
        <div>
          {props.chosenEmployments.map((content) => (
            <div key={content.name} className="flex-col rounded-md py-2 ">
              <input
                className="accent-black mr-2 align-middle"
                type="checkbox"
                onChange={(e) => {
                  content.checked = e.target.checked
                  props.setChosenEmployments([...props.chosenEmployments])
                }}
              />
              <div className="inline-block text-base">{translationJobTypes[content.name]}</div>
            </div>
          ))}
        </div>
      </div>
      <div />
    </div>
    <div className="border-gray-700 mb-4 border-b">
      <div className="mx-4">
        <p className="mt-2 font-semibold">Sted</p>
        <select
          value={props.chosenLocation}
          onChange={(e) => props.setChosenLocation(e.target.value)}
          className="border-gray-700 radius my-2 mb-4 h-10 w-full rounded-md border"
          name="places"
        >
          {props.places.map((place) => (
            <option key={place}>{place}</option>
          ))}
          <option key="Alle" value="Alle">
            Alle
          </option>
        </select>
      </div>
    </div>
    <div>
      <div className="mx-4">
        <p className="mt-4 font-semibold">Sorter</p>
        <select
          onChange={(e) => {
            props.setChosenSort(e.target.value as SortOption)
          }}
          className="border-gray-700 radius my-2 mb-4 h-10 w-full rounded-md border"
          name="kategorier"
        >
          {sortOption.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </div>
    </div>
  </div>
)
