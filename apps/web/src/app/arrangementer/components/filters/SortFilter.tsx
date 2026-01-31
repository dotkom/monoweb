"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, cn } from "@dotkomonline/ui"
import type { EventListViewMode } from "../EventList"
import { IconArrowsSort } from "@tabler/icons-react"

interface SortFilterProps {
  value: EventListViewMode
  onChange: (mode: EventListViewMode) => void
  className?: string
}

export const SortFilter = ({ value, onChange, className }: SortFilterProps) => {
  return (
    <div className={className}>
      <Select value={value} onValueChange={(v) => onChange(v as EventListViewMode)}>
        <SelectTrigger className="h-11.5 rounded-lg min-w-40 md:dark:border-none">
          <div className="flex items-center gap-2">
            <IconArrowsSort className="size-5" /> <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent
          position="item-aligned"
          className="rounded-lg -ml-[2px] pl-[4px] py-[2px] md:dark:border-none shadow-none md:w-40"
        >
          <SelectItem value="ATTENDANCE" className="h-10 md:h-8 rounded-md ">
            Påmelding
          </SelectItem>
          <SelectItem value="CHRONOLOGICAL" className="h-10 md:h-8 rounded-md">
            Kronologisk
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
