import { Form } from "@/components/forms/Form"
import { MultiSelectField } from "@/components/forms/MultiSelectField"
import { SearchField } from "@/components/forms/SearchField"
import { AuditLogOperation, AuditLogTable, type AuditLogFilterQuery } from "@dotkomonline/rpc/audit-log"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useDebounce } from "use-debounce"

interface Props {
  onChange(filters: AuditLogFilterQuery): void
  defaultValues?: AuditLogFilterQuery
}

export const AuditLogFilters = ({ onChange, defaultValues }: Props) => {
  const form = useForm<AuditLogFilterQuery>({
    defaultValues,
  })
  const data = useWatch(form) as AuditLogFilterQuery
  const [debouncedData] = useDebounce(data, 300)

  useEffect(() => {
    onChange(debouncedData)
  }, [onChange, debouncedData])

  return (
    <Form form={form} onSubmit={onChange} className="flex flex-row flex-wrap gap-2">
      <SearchField fixedWidth control={form.control} name="bySearchTerm" placeholder="Søk etter hendelse..." />
      <MultiSelectField
        fixedWidth
        control={form.control}
        name="byTableName"
        placeholder="Filtrer etter type"
        options={AuditLogTable.options.map((option) => ({
          label: option,
          value: option,
        }))}
      />
      <MultiSelectField
        fixedWidth
        control={form.control}
        name="byOperation"
        placeholder="Filtrer etter handling"
        options={AuditLogOperation.options.map((option) => ({
          label: option,
          value: option,
        }))}
      />
    </Form>
  )
}
