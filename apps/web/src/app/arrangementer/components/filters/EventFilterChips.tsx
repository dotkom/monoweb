"use client"

import { FilterChips, type FilterChip } from "@/components/molecules/ListFilters/FilterChips"
import type { EventType } from "@dotkomonline/rpc/event"
import { getGroupDisplayName, type Group } from "@dotkomonline/rpc/group"
import { mapEventTypeToLabel } from "@dotkomonline/rpc/event"
import type { EventListViewMode } from "../EventList"

type FilterType = "search" | "type" | "group" | "sort"

interface EventListFilterChipsProps {
  searchTerm: string
  typeFilter: string[]
  groupFilters: string[]
  viewMode: EventListViewMode
  groups: Group[]
  onRemoveFilter: (filterType: FilterType, value?: string) => void
  onResetAll: () => void
}

export const EventListFilterChips = ({
  searchTerm,
  typeFilter,
  groupFilters,
  viewMode,
  groups,
  onRemoveFilter,
  onResetAll,
}: EventListFilterChipsProps) => {
  const getGroupName = (slug: string) => {
    const group = groups.find((g) => g.slug === slug)
    return group ? getGroupDisplayName(group) : slug
  }

  const chips: FilterChip[] = []

  if (searchTerm) {
    chips.push({ key: `search-${searchTerm}`, label: `'${searchTerm}'`, onRemove: () => onRemoveFilter("search") })
  }

  for (const type of typeFilter) {
    chips.push({
      key: `type-${type}`,
      label: mapEventTypeToLabel(type as EventType),
      onRemove: () => onRemoveFilter("type", type),
    })
  }

  for (const groupSlug of groupFilters) {
    chips.push({
      key: `group-${groupSlug}`,
      label: getGroupName(groupSlug),
      onRemove: () => onRemoveFilter("group", groupSlug),
    })
  }

  if (viewMode === "CHRONOLOGICAL") {
    chips.push({
      key: `sort-${viewMode}`,
      label: "Sorter kronologisk",
      onRemove: () => onRemoveFilter("sort"),
    })
  }

  return <FilterChips chips={chips} onResetAll={onResetAll} />
}
