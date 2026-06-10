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
import type { EventListViewMode } from "../EventList"
import { IconCalendar, IconUsersPlus } from "@tabler/icons-react"

const sortOptions = [
  { value: "ATTENDANCE", label: "Påmelding", icon: IconUsersPlus },
  { value: "CHRONOLOGICAL", label: "Dato", icon: IconCalendar },
] as const

interface SortFilterProps {
  value: EventListViewMode
  onChange: (mode: EventListViewMode) => void
  className?: string
}

export const SortFilter = ({ value, onChange, className }: SortFilterProps) => {
  return (
    <div className={cn("h-full self-stretch", className)}>
      <Select
        items={sortOptions}
        value={value}
        onValueChange={(selectedValue) => onChange(selectedValue as EventListViewMode)}
      >
        <SelectTrigger className="rounded-lg min-w-40 font-normal h-10 md:h-full!">
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
