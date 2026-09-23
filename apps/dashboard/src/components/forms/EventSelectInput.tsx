"use client"

import { useEventAllQuery, useEventWithAttendancesGetQuery } from "@/app/(internal)/arrangementer/queries"
import type { EventId } from "@dotkomonline/rpc/event"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@dotkomonline/ui"
import { useEffect, useMemo, useState } from "react"

export type EventSelectOption = {
  label: string
  value: EventId
}

export type EventSelectInputProps = {
  id?: string
  value: string
  onChange: (eventId: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  excludeChildEvents?: boolean
  excludeEventIds?: EventId[]
}

export function EventSelectInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  required,
  invalid,
  excludeChildEvents = false,
  excludeEventIds,
}: EventSelectInputProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => {
      clearTimeout(timeout)
    }
  }, [searchQuery])

  const { events, isFetching } = useEventAllQuery({
    filter: {
      bySearchTerm: debouncedSearchQuery,
      excludingChildEvents: excludeChildEvents,
    },
    shouldKeepPreviousData: true,
  })

  const selectedEventId = value.length > 0 ? value : null
  const { data: selectedEvent, isLoading: isSelectedEventLoading } = useEventWithAttendancesGetQuery(
    selectedEventId ?? "",
    Boolean(selectedEventId)
  )

  const options = useMemo(() => {
    const fromSearch: EventSelectOption[] = events
      .filter(({ event }) => !excludeEventIds?.some((excludeId) => event.id === excludeId))
      .map(({ event }) => ({
        label: event.title,
        value: event.id,
      }))

    if (selectedEvent?.event && !fromSearch.some((option) => option.value === selectedEvent.event.id)) {
      fromSearch.push({
        value: selectedEvent.event.id,
        label: selectedEvent.event.title,
      })
    }

    return fromSearch
  }, [events, excludeEventIds, selectedEvent])

  const selectedOption = useMemo(() => {
    if (!selectedEventId) {
      return null
    }

    return options.find((option) => option.value === selectedEventId) ?? null
  }, [options, selectedEventId])

  const newFetchIsPending = isFetching || searchQuery !== debouncedSearchQuery

  return (
    <Combobox
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setSearchQuery("")
        }
      }}
      id={id}
      disabled={disabled}
      required={required}
      items={options}
      value={selectedOption}
      onValueChange={(next: EventSelectOption | null, eventDetails) => {
        if (eventDetails.reason === "input-clear") {
          return
        }

        onChange(next?.value ?? "")
      }}
      inputValue={open ? searchQuery : (selectedOption?.label ?? "")}
      onInputValueChange={(next) => {
        if (!open) {
          return
        }

        setSearchQuery(next)
      }}
      itemToStringLabel={(item: EventSelectOption) => item.label}
      isItemEqualToValue={(a: EventSelectOption, b: EventSelectOption) => a.value === b.value}
    >
      <ComboboxInput
        placeholder={isSelectedEventLoading ? "Henter arrangement..." : placeholder}
        showClear={!required}
        aria-invalid={invalid ? true : undefined}
      />
      <ComboboxContent>
        <ComboboxEmpty>{newFetchIsPending ? "Laster arrangementer..." : "Ingen arrangement funnet"}</ComboboxEmpty>
        <ComboboxList>
          {(item: EventSelectOption) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
