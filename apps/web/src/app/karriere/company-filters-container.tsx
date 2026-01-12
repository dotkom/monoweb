import type { JobListingEmployment } from "@dotkomonline/types"
import {
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
  TextInput,
} from "@dotkomonline/ui"
import type { Dispatch, FC, SetStateAction } from "react"

export interface EmploymentCheckbox {
  name: JobListingEmployment
  checked: boolean
}

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
  <div className="border-gray-200 dark:border-stone-700 h-fit xl:w-72 rounded-lg border shadow-b-sm dark:bg-stone-800 flex flex-col p-4 gap-4">
    <p className="font-semibold">Søk</p>

    <TextInput
      placeholder="Søk bedriftsnavn"
      onChange={(e) => {
        props.setSearchName(e.target.value)
      }}
    />
    <p className="font-semibold">Jobbtyper</p>
    <div className="flex flex-col gap-2">
      {props.chosenEmployments.map((item) => (
        <Checkbox
          key={item.name}
          id={item.name}
          label={translationJobTypes[item.name]}
          checked={item.checked}
          onCheckedChange={(checked) => {
            item.checked = checked === "indeterminate" ? false : checked
            props.setChosenEmployments([...props.chosenEmployments])
          }}
        />
      ))}
    </div>
    <p className="font-semibold">Sted</p>

    <Select defaultValue={props.chosenLocation} onValueChange={(e) => props.setChosenLocation(e)} name="places">
      <SelectTrigger>
        <SelectValue placeholder={props.chosenLocation} />
      </SelectTrigger>
      <SelectContent>
        <SelectScrollUpButton />
        {props.places.map((place) => (
          <SelectItem value={place} key={place}>
            {place}
          </SelectItem>
        ))}

        <SelectItem value="Alle" key={"Alle"}>
          Alle
        </SelectItem>
        <SelectScrollDownButton />
      </SelectContent>
    </Select>
    <p className="font-semibold">Sorter</p>

    <Select defaultValue={sortOption[0]} onValueChange={(e) => props.setChosenSort(e as SortOption)} name="kategorier">
      <SelectTrigger>
        <SelectValue placeholder="Kategori" />
      </SelectTrigger>
      <SelectContent>
        <SelectScrollUpButton />
        {sortOption.map((category) => (
          <SelectItem value={category} key={category}>
            {category}
          </SelectItem>
        ))}
        <SelectScrollDownButton />
      </SelectContent>
    </Select>
  </div>
)
