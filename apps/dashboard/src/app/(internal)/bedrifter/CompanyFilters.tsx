import { Form } from "@/components/forms/new-form/Form"
import { SearchField } from "@/components/forms/SearchField"
import type { CompanyFilterQuery } from "@dotkomonline/rpc/company"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useDebounce } from "use-debounce"

interface Props {
  onChange(filters: CompanyFilterQuery): void
  defaultValues?: CompanyFilterQuery
}

export const CompanyFilters = ({ onChange, defaultValues }: Props) => {
  const form = useForm<CompanyFilterQuery>({
    defaultValues,
  })
  const data = useWatch(form) as CompanyFilterQuery
  const [debouncedData] = useDebounce(data, 300)

  useEffect(() => {
    onChange(debouncedData)
  }, [onChange, debouncedData])

  return (
    <Form form={form} onSubmit={onChange}>
      <SearchField
        control={form.control}
        name="bySearchTerm"
        placeholder="Søk etter bedrifter..."
        wrapperClassName="w-64!"
      />
    </Form>
  )
}
