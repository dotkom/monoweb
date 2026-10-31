"use client"

import { cn, ToggleGroup, ToggleGroupItem } from "@dotkomonline/ui"
import type { EventListViewMode } from "../../utils/event-filters"
import { IconCalendar, IconUsersPlus } from "@tabler/icons-react"

const SORT_OPTIONS = [
  { value: "ATTENDANCE", label: "Relevans", icon: IconUsersPlus },
  { value: "CHRONOLOGICAL", label: "Dato", icon: IconCalendar },
] as const

interface EventSortFilterProps {
  value: EventListViewMode
  onChange: (mode: EventListViewMode) => void
  className?: string
}

export const EventSortFilter = ({ value, onChange, className }: EventSortFilterProps) => {
  return (
    <ToggleGroup
      aria-label="Sorter arrangementer"
      className={cn("shrink-0 h-10 w-48 bg-background", className)}
      multiple={false}
      spacing={0}
      color="blue"
      value={[value]}
      onValueChange={(values) => {
        const selectedOption = SORT_OPTIONS.find((option) => option.value === values.at(0))

        if (selectedOption) {
          onChange(selectedOption.value)
        }
      }}
    >
      {SORT_OPTIONS.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value} className="grow h-full gap-2 border-field-border">
          <option.icon className="size-4.75" />
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
