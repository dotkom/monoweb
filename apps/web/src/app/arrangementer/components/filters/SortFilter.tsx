"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@dotkomonline/ui"
import type { EventListViewMode } from "../EventList"
import { IconArrowsSort } from "@tabler/icons-react"

interface SortFilterProps {
  value: EventListViewMode
  onChange: (mode: EventListViewMode) => void
}

export const SortFilter = ({ value, onChange }: SortFilterProps) => {
  return (
    <div className="flex flex-col gap-1 md:gap-1.5">
      <Select value={value} onValueChange={(v) => onChange(v as EventListViewMode)}>
        <SelectTrigger className="h-[2.875rem] rounded-lg min-w-40 md:dark:border-none">
          <div className="flex gap-1">
            <IconArrowsSort className="size-5" /> <SelectValue />
          </div>
        </SelectTrigger>

        <SelectContent className="rounded-lg md:dark:border-none shadow-none min-w-40">
          <SelectItem value="ATTENDANCE" className="rounded-md h-10 md:h-8">
            Påmelding
          </SelectItem>
          <SelectItem value="CHRONOLOGICAL" className="rounded-md h-10 md:h-8">
            Kronologisk
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
