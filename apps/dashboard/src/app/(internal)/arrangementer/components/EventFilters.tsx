import { Form } from "@/components/forms/new-form/Form"
import { SearchField } from "@/components/forms/SearchField"
import type { EventFilterQuery } from "@dotkomonline/rpc/event"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useDebounce } from "use-debounce"

interface Props {
  onChange(filters: EventFilterQuery): void
  defaultValues?: EventFilterQuery
}

export const EventFilters = ({ onChange, defaultValues }: Props) => {
  const form = useForm<EventFilterQuery>({
    defaultValues,
  })
  const data = useWatch(form) as EventFilterQuery
  const [debouncedData] = useDebounce(data, 300)

  useEffect(() => {
    onChange(debouncedData)
  }, [onChange, debouncedData])

  return (
    <Form form={form} onSubmit={onChange} className="flex flex-row flex-wrap gap-2">
      <SearchField fixedWidth control={form.control} name="bySearchTerm" placeholder="Søk etter arrangementer..." />
    </Form>
  )
}
