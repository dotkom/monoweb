import type { EventFilterQuery } from "@dotkomonline/types"
import { TextInput } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

interface Props {
  onChange(filters: EventFilterQuery): void
}

export const EventFilters = ({ onChange }: Props) => {
  const { register, watch } = useForm<EventFilterQuery>({})
  const data = watch()
  const [debouncedData] = useDebouncedValue(data, 300)

  useEffect(() => {
    onChange(debouncedData)
  }, [onChange, debouncedData])

  return (
    <form>
      <TextInput placeholder="Søk etter arrangementer..." {...register("bySearchTerm")} />
    </form>
  )
}
