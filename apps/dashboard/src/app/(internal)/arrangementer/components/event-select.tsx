"use client"

import { useEventAllQuery, useEventWithAttendancesGetQuery } from "@/app/(internal)/arrangementer/queries"
import type { EventId } from "@dotkomonline/rpc/event"
import { Select, type SelectProps } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { useState, type FC } from "react"

interface EventSelectProps extends Omit<SelectProps, "data" | "searchable" | "onSearchChange" | "searchValue"> {
  excludeChildEvents?: boolean
  excludeEventIds?: EventId[]
}

export const EventSelect: FC<EventSelectProps> = ({
  excludeChildEvents = false,
  excludeEventIds,
  value,
  ...props
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300)

  const { events } = useEventAllQuery({
    filter: {
      bySearchTerm: debouncedSearchQuery,
      excludingChildEvents: excludeChildEvents,
    },
  })

  const selectedEventId = typeof value === "string" ? value : null
  const { data: selectedEvent } = useEventWithAttendancesGetQuery(selectedEventId ?? "", Boolean(selectedEventId))

  const options = events
    .filter(({ event }) => !excludeEventIds?.some((excludeId) => event.id === excludeId))
    .map(({ event }) => ({ label: event.title, value: event.id }))

  if (selectedEvent?.event && !options.some((option) => option.value === selectedEvent.event.id)) {
    options.push({
      value: selectedEvent.event.id,
      label: selectedEvent.event.title,
    })
  }

  return (
    <Select
      {...props}
      value={value}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchable
      data={options}
    />
  )
}
