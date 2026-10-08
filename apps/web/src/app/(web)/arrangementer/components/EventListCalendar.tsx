"use client"

import { TZDate } from "@date-fns/tz"
import type { EventFilterQuery, EventType } from "@dotkomonline/rpc/event"
import { Button, Text, cn } from "@dotkomonline/ui"
import { Calendar, CalendarDayButton } from "@dotkomonline/ui/components/calendar"
import { IconX } from "@tabler/icons-react"
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns"
import { nb } from "date-fns/locale"
import { type ComponentProps, useEffect, useMemo, useState } from "react"
import { eventCategories } from "./calendar/eventTypeConfig"
import { EVENT_TIME_ZONE, getEventDateKey, getEventDateRange } from "../utils/event-date"
import { useEventAllSummariesInfiniteQuery } from "./queries"
import { capitalizeFirstLetter } from "@dotkomonline/utils"

interface Props {
  filter: EventFilterQuery
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
}

export const EventListCalendar = ({ filter, selectedDate, onSelectDate }: Props) => {
  const [month, setMonth] = useState(() =>
    selectedDate ? getEventDateRange(selectedDate).min : new TZDate(new Date(), EVENT_TIME_ZONE)
  )

  const { byStartDate: _selectedDateRange, ...calendarFilter } = filter

  const queryResult = useEventAllSummariesInfiniteQuery({
    filter: {
      ...calendarFilter,
      byStartDate: {
        min: new TZDate(startOfWeek(startOfMonth(month), { weekStartsOn: 1 }), EVENT_TIME_ZONE),
        max: new TZDate(endOfWeek(endOfMonth(month), { weekStartsOn: 1 }), EVENT_TIME_ZONE),
      },
      orderBy: "asc",
    },
    page: { take: 100 },
  })

  const { eventDetails, hasNextPage, fetchNextPage, isFetchingNextPage, isError } = queryResult

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !isError) {
      void fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage])

  useEffect(() => {
    if (selectedDate) {
      setMonth(getEventDateRange(selectedDate).min)
    }
  }, [selectedDate])

  const eventTypesByDate = useMemo(() => {
    const dates = new Map<string, Set<EventType>>()

    for (const { event } of eventDetails) {
      const key = getEventDateKey(event.start)
      const types = dates.get(key) ?? new Set<EventType>()

      types.add(event.type)
      dates.set(key, types)
    }

    return dates
  }, [eventDetails])

  const hasEvents = (day: Date) => eventTypesByDate.has(getEventDateKey(day))

  const calendarComponents = useMemo(
    () => ({
      DayButton: ({ children, day, modifiers, className, ...props }: ComponentProps<typeof CalendarDayButton>) => {
        const types = eventTypesByDate.get(getEventDateKey(day.date))

        const categories = Object.entries(eventCategories)
          .filter(([type]) => types?.has(type as EventType))
          .map(([, category]) => category)

        const description = categories.map((category) => category.displayName).join(", ")

        const colors = [...new Set(categories.map((category) => category.classes.guide))]
        const visibleColors = colors.length > 3 ? colors.slice(0, 2) : colors
        const extraColors = colors.length - visibleColors.length

        return (
          <CalendarDayButton
            {...props}
            day={day}
            modifiers={modifiers}
            locale={nb}
            className={cn(className, modifiers.today && !modifiers.selected && "font-semibold disabled:opacity-75")}
            title={description || undefined}
            aria-label={description ? `${props["aria-label"]}, ${description}` : props["aria-label"]}
          >
            {children}

            {colors.length > 0 && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0.5 flex h-2 items-center justify-center gap-0.5"
              >
                {visibleColors.map((color) => (
                  <span
                    key={color}
                    className={cn(
                      "size-1 rounded-full",
                      color,
                      modifiers.selected && "ring-1 ring-primary-foreground/70"
                    )}
                  />
                ))}

                {extraColors > 0 && (
                  <span className={cn("text-[8px] mt-0.5", !modifiers.selected && "text-muted-foreground")}>
                    +{extraColors}
                  </span>
                )}
              </div>
            )}
          </CalendarDayButton>
        )
      },
    }),
    [eventTypesByDate]
  )

  return (
    <aside aria-label="Filtrer arrangementer etter dato" className="mt-2 rounded-xl border border-field-border p-3">
      <Calendar
        mode="single"
        locale={nb}
        timeZone={EVENT_TIME_ZONE}
        weekStartsOn={1}
        month={month}
        onMonthChange={(date) => setMonth(new TZDate(date, EVENT_TIME_ZONE))}
        selected={selectedDate ? getEventDateRange(selectedDate).min : undefined}
        onSelect={(date) => onSelectDate(date ? getEventDateKey(date) : null)}
        disabled={(day) => !hasEvents(day)}
        components={calendarComponents}
        classNames={{
          today: "rounded-lg bg-muted [&_button]:font-semibold",
          disabled: "text-muted-foreground opacity-50 data-[today=true]:opacity-100",
        }}
        formatters={{
          formatCaption: (date) =>
            capitalizeFirstLetter(date.toLocaleString(nb.code, { month: "long", year: "numeric" })),
        }}
        className="p-0 w-full bg-transparent [--cell-size:--spacing(8)]"
      />

      {isError && (
        <Text className="px-2 pt-2 text-xs text-muted-foreground" role="status">
          Kunne ikke laste arrangementer.
        </Text>
      )}

      {selectedDate && (
        <Button className="relative px-2 mt-2 w-full rounded-sm" onClick={() => onSelectDate(null)}>
          Vis alle datoer
          <IconX className="size-4 absolute right-2 top-1/2 -translate-y-1/2" />
        </Button>
      )}
    </aside>
  )
}
