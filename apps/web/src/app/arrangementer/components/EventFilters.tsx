"use client"

import type { EventFilterQuery } from "@dotkomonline/types"
import { TextInput } from "@dotkomonline/ui"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useDebounce } from "use-debounce"

interface Props {
    onChange(filters: EventFilterQuery): void
}

export const EventFilters = ({ onChange }: Props) => {
    const form = useForm<EventFilterQuery>()
    const data = useWatch(form) as EventFilterQuery
    const [debouncedData] = useDebounce(data, 300)

    useEffect(() => {
        onChange(debouncedData)
    }, [onChange, debouncedData])

    const handleSubmit = (values: EventFilterQuery) => {
        onChange(values)
    }

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)}>
            <TextInput placeholder="Søk etter arrangementer..." {...form.register("bySearchTerm")} />
        </form>
    )
}
