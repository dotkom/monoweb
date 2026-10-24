"use client"

import { cn, ToggleGroup, ToggleGroupItem } from "@dotkomonline/ui"
import { IconCalendarPlus, IconHourglassLow } from "@tabler/icons-react"
import type { JobListingSort } from "../../hooks/useJobListingFilters"

const sortOptions = [
  { value: "DEADLINE", label: "Frist", icon: IconHourglassLow },
  { value: "PUBLISHED", label: "Publisert", icon: IconCalendarPlus },
] as const

interface JobSortFilterProps {
  value: JobListingSort
  onChange: (sort: JobListingSort) => void
  className?: string
}

export const JobSortFilter = ({ value, onChange, className }: JobSortFilterProps) => {
  return (
    <ToggleGroup
      aria-label="Sorter stillinger"
      className={cn("shrink-0 h-10 bg-background", className)}
      multiple={false}
      spacing={0}
      color="blue"
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
