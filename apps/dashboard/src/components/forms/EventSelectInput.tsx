import { useEventAllQuery, useEventWithAttendancesGetQuery } from "@/app/(internal)/arrangementer/queries"
import type { EventId } from "@dotkomonline/types"
import { ErrorMessage } from "@hookform/error-message"
import { Select, type SelectProps } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { useState } from "react"
import { Controller, type FieldValues, useController } from "react-hook-form"
import type { InputProducerResult } from "./types"

interface Props extends Omit<SelectProps, "error"> {
  excludeEventIds?: EventId[]
}

export function createEventSelectInput<F extends FieldValues>({
  excludeEventIds,
  ...props
}: Props): InputProducerResult<F> {
  return function FormSelectInput({ name, state, control }) {
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300)

    const { events: data } = useEventAllQuery({
      filter: {
        bySearchTerm: debouncedSearchQuery,
      },
    })

    const { field } = useController({ name, control })
    const { data: selectedEvent } = useEventWithAttendancesGetQuery(field.value, Boolean(field.value))

    const options = data
      .filter(({ event }) => !excludeEventIds?.some((excludeId) => event.id === excludeId))
      .map(({ event }) => ({ label: event.title, value: event.id }))

    // Always include the selected event in the list
    if (selectedEvent?.event && !options.some((o) => o.value === selectedEvent.event.id)) {
      options.push({
        value: selectedEvent.event.id,
        label: selectedEvent.event.title,
      })
    }

    const handleEventSearch = (query: string) => {
      setSearchQuery(query)
    }

    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            {...props}
            value={field.value}
            onChange={field.onChange}
            searchValue={searchQuery}
            onSearchChange={handleEventSearch}
            searchable={true}
            error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
            data={options}
          />
        )}
      />
    )
  }
}
