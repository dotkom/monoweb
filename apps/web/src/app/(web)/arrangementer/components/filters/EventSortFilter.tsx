"use client"

import { cn, ToggleGroup, ToggleGroupItem } from "@dotkomonline/ui"
import type { EventListViewMode } from "../EventList"
import { IconCalendar, IconUsersPlus } from "@tabler/icons-react"

const sortOptions = [
  { value: "ATTENDANCE", label: "Påmelding", icon: IconUsersPlus },
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
      className={cn("shrink-0 h-10 min-w-48", className)}
      multiple={false}
      spacing={0}
      value={[value]}
      onValueChange={(values) => {
        const selected = sortOptions.find((option) => option.value === values.at(0))
        if (selected) onChange(selected.value)
      }}
    >
      {sortOptions.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value} className="h-full gap-2 border-field-border">
          <option.icon className="size-4.5" />
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
