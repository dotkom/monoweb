import type { EventFilterQuery } from "@dotkomonline/types"
import { TextInput } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"

interface Props {
  onChange(filters: EventFilterQuery): void
}

export const EventFilters = ({ onChange }: Props) => {
  const form = useForm<EventFilterQuery>()
  const data = useWatch(form) as EventFilterQuery
  const [debouncedData] = useDebouncedValue(data, 300)

  useEffect(() => {
    onChange(debouncedData)
  }, [onChange, debouncedData])

  return (
    <form>
      <TextInput placeholder="Søk etter arrangementer..." {...form.register("bySearchTerm")} />
    </form>
  )
}
