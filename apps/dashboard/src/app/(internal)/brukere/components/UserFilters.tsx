"use client"

import { Form } from "@/components/forms/Form"
import { SearchField } from "@/components/forms/SearchField"
import type { UserFilterQuery } from "@dotkomonline/rpc/user"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useDebounce } from "use-debounce"

interface Props {
  onChange(filters: UserFilterQuery): void
}

interface FormValues {
  search: string
}

export function UserFilters({ onChange }: Props) {
  const form = useForm<FormValues>({
    defaultValues: { search: "" },
  })
  const data = useWatch(form) as FormValues
  const [debouncedData] = useDebounce(data, 300)

  useEffect(() => {
    onChange({
      byName: debouncedData.search,
      byEmail: debouncedData.search,
    })
  }, [onChange, debouncedData])

  return (
    <Form form={form} onSubmit={() => {}}>
      <SearchField fixedWidth control={form.control} name="search" placeholder="Søk etter navn eller e-post..." />
    </Form>
  )
}
