import {
  Select,
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItem,
  SelectLabel,
  SelectPortal,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "./index"
import React from "react"

export const Default = () => (
  <Select>
    <SelectTrigger>
      <SelectValue placeholder="Velg anledning" />
      <SelectIcon />
    </SelectTrigger>
    <SelectPortal>
      <SelectContent>
        <SelectScrollUpButton />
        <SelectViewport>
          <SelectGroup>
            <SelectLabel>Arrangementtyper</SelectLabel>
            <SelectItem value="company_presentation" label="Bedriftspresentasjon" />
            <SelectItem value="course" label="Kurs" />
            <SelectItem value="event" label="Arrangement" />
          </SelectGroup>
        </SelectViewport>
        <SelectScrollDownButton />
      </SelectContent>
    </SelectPortal>
  </Select>
)
