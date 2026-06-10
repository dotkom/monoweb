"use client"

import { cn, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@dotkomonline/ui"
import type { EventListViewMode } from "../EventList"
import { IconArrowsSort } from "@tabler/icons-react"

const sortOptions = [
  { value: "ATTENDANCE", label: "Påmelding" },
  { value: "CHRONOLOGICAL", label: "Kronologisk" },
] as const

interface SortFilterProps {
  value: EventListViewMode
  onChange: (mode: EventListViewMode) => void
  className?: string
}

export const SortFilter = ({ value, onChange, className }: SortFilterProps) => {
  return (
    <div className={cn("h-full flex items-center gap-2", className)}>
      <IconArrowsSort className="size-5" />

      <Select
        items={sortOptions}
        value={value}
        onValueChange={(selectedValue) => onChange(selectedValue as EventListViewMode)}
      >
        <SelectTrigger className="h-full min-w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="item-aligned">
          <SelectGroup>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
