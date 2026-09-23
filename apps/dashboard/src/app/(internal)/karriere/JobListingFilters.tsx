import { Form } from "@/components/forms/new-form/Form"
import { SearchField } from "@/components/forms/SearchField"
import type { JobListingFilterQuery } from "@dotkomonline/rpc/job-listing"
import { useDebouncedValue } from "@mantine/hooks"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"

interface Props {
  onChange(filters: JobListingFilterQuery): void
  defaultValues?: JobListingFilterQuery
}

export const JobListingFilters = ({ onChange, defaultValues }: Props) => {
  const form = useForm<JobListingFilterQuery>({
    defaultValues,
  })
  const data = useWatch(form) as JobListingFilterQuery
  const [debouncedData] = useDebouncedValue(data, 300)

  useEffect(() => {
    onChange(debouncedData)
  }, [onChange, debouncedData])

  return (
    <Form form={form} onSubmit={onChange}>
      <SearchField fixedWidth control={form.control} name="bySearchTerm" placeholder="Søk etter stillingsannonser..." />
    </Form>
  )
}
