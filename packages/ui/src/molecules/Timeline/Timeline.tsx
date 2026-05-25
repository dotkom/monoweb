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
import { Fragment, type FC, type ReactNode } from "react"
import { useMemo } from "react"
import { Text } from "../../atoms/Typography/Text"
import { cn } from "../../utils"

export type TimelineGroupBy = "day" | "week" | "month" | "year"
export type TimelineSortOrder = "asc" | "desc"
export type TimelineLabelPosition = "before-dot" | "after-dot"

export type TimelineEntry = {
  date: Date
  leftContent?: ReactNode
  rightContent: ReactNode
}

export type TimelineProps = {
  entries: TimelineEntry[]
  groupBy?: TimelineGroupBy
  sortOrder?: TimelineSortOrder
  labelPosition?: TimelineLabelPosition
  locale?: Locale
  className?: string
}

type GroupedTimelineEntry = TimelineEntry & {
  showGroupLabel: boolean
  groupLabel: string
  entryMarker: string
}

type TimelineGroup = {
  key: number
  entries: GroupedTimelineEntry[]
}

const weekOptions = { weekStartsOn: 1 as const }

const getGroupKey = (date: Date, groupBy: TimelineGroupBy) => {
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

const formatGroupLabel = (date: Date, groupBy: TimelineGroupBy, locale: Locale) => {
  switch (groupBy) {
    case "day":
      return format(date, "dd. MMM", { locale })
    case "week": {
      const weekStart = startOfWeek(date, weekOptions)
      const weekEnd = endOfWeek(date, weekOptions)
      return `${format(weekStart, "dd. MMM", { locale })} – ${format(weekEnd, "dd. MMM", { locale })}`
    }
    case "month":
      return format(date, "MMMM yyyy", { locale })
    case "year":
      return format(date, "yyyy", { locale })
  }
}

const formatEntryMarker = (date: Date, groupBy: TimelineGroupBy, locale: Locale) => {
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

const groupTimelineEntries = (
  entries: TimelineEntry[],
  groupBy: TimelineGroupBy,
  sortOrder: TimelineSortOrder,
  locale: Locale
): TimelineGroup[] => {
  const sortedEntries = [...entries].sort((firstEntry, secondEntry) => {
    if (sortOrder === "asc") {
      return compareAsc(firstEntry.date, secondEntry.date)
    }

    return compareDesc(firstEntry.date, secondEntry.date)
  })

  const groups = new Map<number, TimelineGroup>()

  for (const entry of sortedEntries) {
    const groupKey = getGroupKey(entry.date, groupBy)
    const existingGroup = groups.get(groupKey)

    if (existingGroup) {
      existingGroup.entries.push({
        ...entry,
        showGroupLabel: false,
        groupLabel: formatGroupLabel(entry.date, groupBy, locale),
        entryMarker: formatEntryMarker(entry.date, groupBy, locale),
      })
      continue
    }

    groups.set(groupKey, {
      key: groupKey,
      entries: [
        {
          ...entry,
          showGroupLabel: true,
          groupLabel: formatGroupLabel(entry.date, groupBy, locale),
          entryMarker: formatEntryMarker(entry.date, groupBy, locale),
        },
      ],
    })
  }

  return Array.from(groups.values())
}

const timelineLineClassName = "absolute left-1/2 w-1 -translate-x-1/2 bg-brand"

const TimelineDot = () => (
  <span
    aria-hidden="true"
    className={cn("relative z-10 block size-3 shrink-0 rounded-full", "border-[3px] border-brand bg-white")}
  />
)

const TimelineLineSegments = ({
  isFirstEntry,
  isLastEntry,
  hasGroupPaddingTop,
  lineContainerHasPadding,
}: {
  isFirstEntry: boolean
  isLastEntry: boolean
  hasGroupPaddingTop: boolean
  lineContainerHasPadding: boolean
}) => {
  const dotCenterClassName = hasGroupPaddingTop && lineContainerHasPadding ? "top-11.5" : "top-3.5"

  const upperLineClassName = (() => {
    if (!hasGroupPaddingTop) {
      return cn(timelineLineClassName, "top-0 h-3.5")
    }

    if (lineContainerHasPadding) {
      return cn(timelineLineClassName, "top-0 h-11.5")
    }

    return cn(timelineLineClassName, "-top-9 h-11.5")
  })()

  return (
    <>
      {!isFirstEntry && <div aria-hidden="true" className={upperLineClassName} />}

      {isFirstEntry && (
        <div
          aria-hidden="true"
          className={cn(
            timelineLineClassName,
            dotCenterClassName,
            "h-5 -translate-y-full bg-linear-to-t from-brand from-20% via-brand/70 via-45%"
          )}
        />
      )}

      {!isLastEntry && <div aria-hidden="true" className={cn(timelineLineClassName, dotCenterClassName, "bottom-0")} />}

      {isLastEntry && (
        <div
          aria-hidden="true"
          className={cn(
            timelineLineClassName,
            dotCenterClassName,
            "h-6 bg-linear-to-b from-brand from-10% via-brand/70 via-45%"
          )}
        />
      )}
    </>
  )
}

const EntryLabels = ({ entry }: { entry: GroupedTimelineEntry }) => (
  <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0 py-1.5">
    {entry.showGroupLabel && <Text className="whitespace-nowrap font-semibold text-xs">{entry.groupLabel}</Text>}
    <Text className="whitespace-nowrap font-medium text-xs text-gray-500 dark:text-stone-400">{entry.entryMarker}</Text>
  </div>
)

export const Timeline: FC<TimelineProps> = ({
  entries,
  groupBy = "day",
  sortOrder = "asc",
  labelPosition = "before-dot",
  locale = nb,
  className,
}) => {
  const groups = useMemo(
    () => groupTimelineEntries(entries, groupBy, sortOrder, locale),
    [entries, groupBy, sortOrder, locale]
  )

  const showLeftColumn = entries.some((entry) => entry.leftContent != null)
  const totalEntryCount = groups.reduce((count, group) => count + group.entries.length, 0)

  let entryIndex = 0

  const gridClassName =
    labelPosition === "before-dot"
      ? showLeftColumn
        ? "grid-cols-[auto_auto_minmax(0,1fr)]"
        : "grid-cols-[auto_minmax(0,1fr)]"
      : showLeftColumn
        ? "grid-cols-[auto_1.5rem_minmax(0,1fr)]"
        : "grid-cols-[1.5rem_minmax(0,1fr)]"

  return (
    <div className={cn("grid w-full gap-x-4 overflow-visible", gridClassName, className)}>
      {groups.map((group, groupIndex) =>
        group.entries.map((entry, entryIndexInGroup) => {
          const currentEntryIndex = entryIndex
          entryIndex += 1

          const isFirstEntry = currentEntryIndex === 0
          const isLastEntry = currentEntryIndex === totalEntryCount - 1
          const isFirstEntryInGroup = entryIndexInGroup === 0
          const hasGroupPaddingTop = groupIndex > 0 && isFirstEntryInGroup
          const rowSpacing = hasGroupPaddingTop ? "pt-8" : ""
          const dotCenterClassName = hasGroupPaddingTop && labelPosition === "after-dot" ? "top-12" : "top-4"

          if (labelPosition === "after-dot") {
            return (
              <Fragment key={`${group.key}-${currentEntryIndex}`}>
                {showLeftColumn && <div className={cn("min-w-0 self-start py-1", rowSpacing)}>{entry.leftContent}</div>}

                <div className={cn("relative self-stretch overflow-visible", rowSpacing)}>
                  <TimelineLineSegments
                    isFirstEntry={isFirstEntry}
                    isLastEntry={isLastEntry}
                    hasGroupPaddingTop={hasGroupPaddingTop}
                    lineContainerHasPadding
                  />
                  <div className={cn("absolute left-1/2 -translate-x-1/2 -translate-y-1/2", dotCenterClassName)}>
                    <TimelineDot />
                  </div>
                </div>

                <div className={cn("min-w-0 self-start py-1", rowSpacing)}>
                  <div className="flex flex-col gap-2">
                    <EntryLabels entry={entry} />
                    <div className="min-w-0">{entry.rightContent}</div>
                  </div>
                </div>
              </Fragment>
            )
          }

          return (
            <Fragment key={`${group.key}-${currentEntryIndex}`}>
              {showLeftColumn && <div className={cn("min-w-0 self-start py-1", rowSpacing)}>{entry.leftContent}</div>}

              <div
                className={cn(
                  "relative flex items-start justify-end gap-x-2 self-stretch overflow-visible",
                  rowSpacing
                )}
              >
                <EntryLabels entry={entry} />
                <div className="relative w-6 shrink-0 self-stretch overflow-visible">
                  <TimelineLineSegments
                    isFirstEntry={isFirstEntry}
                    isLastEntry={isLastEntry}
                    hasGroupPaddingTop={hasGroupPaddingTop}
                    lineContainerHasPadding={false}
                  />
                  <div className={cn("absolute left-1/2 -translate-x-1/2 -translate-y-1/2", dotCenterClassName)}>
                    <TimelineDot />
                  </div>
                </div>
              </div>

              <div className={cn("min-w-0 self-start py-1", rowSpacing)}>{entry.rightContent}</div>
            </Fragment>
          )
        })
      )}
    </div>
  )
}
