"use client"

import type { EventType, Group } from "@dotkomonline/types"
import { mapEventTypeToLabel } from "@dotkomonline/types"
import { Button, cn } from "@dotkomonline/ui"
import type { EventListViewMode } from "./EventList"
import { IconX } from "@tabler/icons-react"

type FilterType = "search" | "type" | "group" | "sort"

interface FilterChipsProps {
  searchTerm: string
  typeFilter: string[]
  groupFilters: string[]
  viewMode: EventListViewMode
  groups: Group[]
  onRemoveFilter: (filterType: FilterType, value?: string) => void
  onResetAll: () => void
}

export const FilterChips = ({
  searchTerm,
  typeFilter,
  groupFilters,
  viewMode,
  groups,
  onRemoveFilter,
  onResetAll,
}: FilterChipsProps) => {
  const getGroupName = (slug: string) => {
    const group = groups.find((g) => g.slug === slug)
    return group?.abbreviation || slug
  }

  interface Chip {
    label: string
    value: string
    filterType: FilterType
  }

  const chips: Chip[] = []

  if (searchTerm) {
    chips.push({ label: `'${searchTerm}'`, value: searchTerm, filterType: "search" })
  }

  for (const type of typeFilter) {
    chips.push({
      label: mapEventTypeToLabel(type as EventType),
      value: type,
      filterType: "type",
    })
  }

  for (const groupSlug of groupFilters) {
    chips.push({
      label: getGroupName(groupSlug),
      value: groupSlug,
      filterType: "group",
    })
  }

  if (viewMode !== "ATTENDANCE") {
    chips.push({
      label: viewMode === "CHRONOLOGICAL" ? "Sorter kronologisk" : "Sorter etter påmelding",
      value: viewMode,
      filterType: "sort",
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 transition duration-500">
      {chips.map((chip, index) => (
        <button
          type="button"
          key={`${chip.filterType}-${chip.value}-${index}`}
          onClick={() => onRemoveFilter(chip.filterType, chip.value)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm",
            "bg-blue-100 dark:bg-sky-950",
            "text-blue-900 dark:text-sky-200",
            "hover:bg-blue-200 dark:hover:bg-sky-900",
            "transition"
          )}
        >
          <span>{chip.label}</span>
          <IconX className="w-4 h-4" />
        </button>
      ))}

      <Button onClick={onResetAll} variant="solid" size="sm" className="text-sm rounded-full px-3 py-1.5">
        Fjern alle
      </Button>
    </div>
  )
}
