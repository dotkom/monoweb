import { FilterChips, type FilterChip } from "@/components/molecules/ListFilters/FilterChips"
import type { EventType } from "@dotkomonline/rpc/event"
import { getGroupDisplayName, type Group } from "@dotkomonline/rpc/group"
import { mapEventTypeToLabel } from "@dotkomonline/rpc/event"
import type { EventListViewMode } from "../EventList"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { getEventDateRange } from "../../utils/event-date"

type FilterType = "search" | "type" | "group" | "sort" | "date"

interface EventListFilterChipsProps {
  searchTerm: string
  typeFilter: string[]
  groupFilters: string[]
  viewMode: EventListViewMode
  groups: Group[]
  date: string | null
  onRemoveFilter: (filterType: FilterType, value?: string) => void
  onResetAll: () => void
}

export const EventListFilterChips = ({
  searchTerm,
  typeFilter,
  groupFilters,
  viewMode,
  groups,
  date,
  onRemoveFilter,
  onResetAll,
}: EventListFilterChipsProps) => {
  const chips: FilterChip[] = []

  if (date) {
    chips.push({
      key: `date-${date}`,
      label: format(getEventDateRange(date).min, "d. MMMM yyyy", { locale: nb }),
      onRemove: () => onRemoveFilter("date"),
    })
  }

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
    const group = groups.find((g) => g.slug === groupSlug)
    chips.push({
      key: `group-${groupSlug}`,
      label: group ? getGroupDisplayName(group) : groupSlug,
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
