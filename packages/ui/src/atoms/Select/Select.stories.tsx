import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
} from "./Select"

export const Default = () => (
  <Select>
    <SelectTrigger>
      <SelectValue placeholder="Velg anledning" />
    </SelectTrigger>
    <SelectContent>
      <SelectScrollUpButton />
      <SelectGroup>
        <SelectLabel>Arrangementtyper</SelectLabel>
        <SelectItem value="company_presentation">Bedriftspresentasjon</SelectItem>
        <SelectItem value="course">Kurs</SelectItem>
        <SelectItem value="event">Arrangement</SelectItem>
      </SelectGroup>
      <SelectScrollDownButton />
    </SelectContent>
  </Select>
)
