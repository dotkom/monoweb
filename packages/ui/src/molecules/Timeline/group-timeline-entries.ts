import type { Locale } from "date-fns"
import {
  compareAsc,
  compareDesc,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns"
import { nb } from "date-fns/locale"
import { capitalizeFirstLetter } from "@dotkomonline/utils/text"

export type TimelineGroupBy = "day" | "week" | "month" | "year"
export type TimelineSortOrder = "asc" | "desc"

export type GroupTimelineEntriesOptions = {
  groupBy?: TimelineGroupBy
  sortOrder?: TimelineSortOrder
  locale?: Locale
}

export type GroupedTimelineEntry<TEntry> = TEntry & {
  /**
   * Formatted marker for the entry within its group. For example "10:00" when grouped by day.
   */
  marker: string
}

export type TimelineEntryGroup<TEntry> = {
  key: number
  /**
   * Formatted label for the group. For example "11. aug" when grouped by day.
   */
  label: string
  entries: GroupedTimelineEntry<TEntry>[]
}

const weekOptions = { weekStartsOn: 1 as const }

const getGroupKey = (date: Date, groupBy: TimelineGroupBy): number => {
  switch (groupBy) {
    case "day":
      return startOfDay(date).getTime()

    case "week":
      return startOfWeek(date, weekOptions).getTime()

    case "month":
      return startOfMonth(date).getTime()

    case "year":
      return startOfYear(date).getTime()
  }
}

const formatGroupLabel = (date: Date, groupBy: TimelineGroupBy, locale: Locale): string => {
  switch (groupBy) {
    case "day":
      return format(date, "dd. MMM", { locale })

    case "week": {
      const weekStart = startOfWeek(date, weekOptions)
      const weekEnd = endOfWeek(date, weekOptions)

      return `${format(weekStart, "dd. MMM", { locale })} - ${format(weekEnd, "dd. MMM", { locale })}`
    }

    case "month":
      return capitalizeFirstLetter(format(date, "MMMM yyyy", { locale }))

    case "year":
      return format(date, "yyyy", { locale })
  }
}

const formatEntryMarker = (date: Date, groupBy: TimelineGroupBy, locale: Locale): string => {
  switch (groupBy) {
    case "day":
      return format(date, "HH:mm", { locale })

    case "week":
    case "month":
      return format(date, "dd. MMM", { locale })

    case "year":
      return format(date, "MMMM", { locale })
  }
}

/**
 * Sorts dated entries and groups them to render in a `<Timeline>` component.
 *
 * Can group by day, week, month, or year. Sort order can be ascending or descending. This helper creates all labels and
 * markers for the entries.
 */
export const groupTimelineEntries = <TEntry extends { date: Date }>(
  entries: TEntry[],
  options: GroupTimelineEntriesOptions = {}
): TimelineEntryGroup<TEntry>[] => {
  const groupBy = options.groupBy ?? "day"
  const sortOrder = options.sortOrder ?? "asc"
  const locale = options.locale ?? nb

  const sortedEntries = entries.toSorted((firstEntry, secondEntry) => {
    if (sortOrder === "asc") {
      return compareAsc(firstEntry.date, secondEntry.date)
    }

    return compareDesc(firstEntry.date, secondEntry.date)
  })

  const groups = new Map<number, TimelineEntryGroup<TEntry>>()

  for (const entry of sortedEntries) {
    const groupKey = getGroupKey(entry.date, groupBy)
    const groupedEntry = {
      ...entry,
      marker: formatEntryMarker(entry.date, groupBy, locale),
    }

    const existingGroup = groups.get(groupKey)

    if (existingGroup) {
      existingGroup.entries.push(groupedEntry)

      continue
    }

    groups.set(groupKey, {
      key: groupKey,
      label: formatGroupLabel(entry.date, groupBy, locale),
      entries: [groupedEntry],
    })
  }

  return [...groups.values()]
}
