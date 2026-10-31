import { type FilterChip, FilterChips } from "@/components/molecules/ListFilters/FilterChips"
import { mapEventTypeToLabel } from "@dotkomonline/rpc/event"
import { type Group, getGroupDisplayName } from "@dotkomonline/rpc/group"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { DEFAULT_EVENT_SORT, type EventFilters } from "../../utils/event-filters"
import { getEventDateRange } from "../../utils/event-date"

interface EventFilterChipsProps {
  filters: EventFilters
  groups: Group[]
  onChange: (partial: Partial<EventFilters>) => void
  onResetAll: () => void
}

export const EventFilterChips = ({ filters, groups, onChange, onResetAll }: EventFilterChipsProps) => {
  const chips: FilterChip[] = []

  if (filters.date) {
    chips.push({
      key: `date-${filters.date}`,
      label: format(getEventDateRange(filters.date).min, "d. MMMM yyyy", { locale: nb }),
      onRemove: () => onChange({ date: null }),
    })
  }

  if (filters.search) {
    chips.push({ key: "search", label: `'${filters.search}'`, onRemove: () => onChange({ search: "" }) })
  }

  for (const type of filters.types) {
    chips.push({
      key: `type-${type}`,
      label: mapEventTypeToLabel(type),
      onRemove: () => onChange({ types: filters.types.filter((other) => other !== type) }),
    })
  }

  for (const slug of filters.groups) {
    const group = groups.find((candidate) => candidate.slug === slug)

    chips.push({
      key: `group-${slug}`,
      label: group ? getGroupDisplayName(group) : slug,
      onRemove: () => onChange({ groups: filters.groups.filter((other) => other !== slug) }),
    })
  }

  if (filters.sort === "CHRONOLOGICAL") {
    chips.push({ key: "sort", label: "Sorter kronologisk", onRemove: () => onChange({ sort: DEFAULT_EVENT_SORT }) })
  }

  return <FilterChips chips={chips} onResetAll={onResetAll} />
}
