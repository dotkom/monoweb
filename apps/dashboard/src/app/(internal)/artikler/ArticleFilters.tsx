import { Form } from "@/components/forms/new-form/Form"
import { SearchField } from "@/components/forms/SearchField"
import { SelectField } from "@/components/forms/SelectField"
import type { ArticleFilterQuery } from "@dotkomonline/rpc/article"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useDebounce } from "use-debounce"

interface Props {
  onChange(filters: ArticleFilterQuery): void
  defaultValues?: ArticleFilterQuery
}

export const ArticleFilters = ({ onChange, defaultValues }: Props) => {
  const form = useForm<ArticleFilterQuery>({
    defaultValues,
  })
  const data = useWatch(form) as ArticleFilterQuery
  const [debouncedData] = useDebounce(data, 300)

  useEffect(() => {
    onChange(debouncedData)
  }, [onChange, debouncedData])

  return (
    <Form form={form} onSubmit={onChange} className="flex flex-row flex-wrap gap-2">
      <SearchField fixedWidth control={form.control} name="bySearchTerm" placeholder="Søk etter artikler..." />
      <SelectField
        fixedWidth
        control={form.control}
        name="byIsFeatured"
        placeholder="Velg filter"
        options={[
          { label: "Fremhevet", value: true },
          { label: "Ikke fremhevet", value: false },
        ]}
      />
    </Form>
  )
}
