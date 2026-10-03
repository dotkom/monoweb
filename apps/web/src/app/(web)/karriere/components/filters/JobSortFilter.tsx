"use client"

import {
  cn,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@dotkomonline/ui"
import { IconHourglassLow, IconCalendarPlus } from "@tabler/icons-react"
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
    <div className={cn("h-full self-stretch", className)}>
      <Select
        items={sortOptions}
        value={value}
        onValueChange={(selectedValue) => onChange(selectedValue as JobListingSort)}
      >
        <SelectTrigger className="rounded-lg min-w-43 font-normal h-10 md:h-full!">
          <span className="flex items-center gap-1.5">
            <span className="text-muted-foreground max-md:hidden">Sorter:</span>
            <SelectValue className="font-medium text-foreground" />
          </span>
        </SelectTrigger>
        <SelectContent position="popper" className="rounded-lg shadow-md">
          <SelectGroup>
            <SelectLabel className="font-medium">Sorter etter</SelectLabel>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="h-9">
                <option.icon className="size-4.5" />
                <span className="text-sm font-medium">{option.label}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
