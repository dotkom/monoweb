import { Form } from "@/components/forms/Form"
import { SearchField } from "@/components/forms/SearchField"
import type { JobListingFilterQuery } from "@dotkomonline/rpc/job-listing"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useDebounce } from "use-debounce"

interface Props {
  onChange(filters: JobListingFilterQuery): void
  defaultValues?: JobListingFilterQuery
}

export const JobListingFilters = ({ onChange, defaultValues }: Props) => {
  const form = useForm<JobListingFilterQuery>({
    defaultValues,
  })
  const data = useWatch(form) as JobListingFilterQuery
  const [debouncedData] = useDebounce(data, 300)

  useEffect(() => {
    onChange(debouncedData)
  }, [onChange, debouncedData])

  return (
    <Form form={form} onSubmit={onChange}>
      <SearchField fixedWidth control={form.control} name="bySearchTerm" placeholder="Søk etter stillingsannonser..." />
    </Form>
  )
}
