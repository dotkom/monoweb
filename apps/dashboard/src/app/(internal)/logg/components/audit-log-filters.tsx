import {
  AuditLogTable,
  type AuditLogFilterQuery,
  AuditLogOperation,
} from "@dotkomonline/types"
import { Group, MultiSelect, TextInput } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { useEffect } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

interface Props {
  onChange(filters: AuditLogFilterQuery): void
}

export const AuditLogFilters = ({ onChange }: Props) => {
  const form = useForm<AuditLogFilterQuery>()
  const data = useWatch(form) as AuditLogFilterQuery
  const [debouncedData] = useDebouncedValue(data, 300)

  useEffect(() => {
    onChange(debouncedData)
  }, [onChange, debouncedData])

  return (
    <form>
      <Group mb="xs" gap="xs">
        <TextInput placeholder="Søk etter hendelse..." {...form.register("bySearchTerm")} autoComplete="search" />
        <Controller
          name="byTableName"
          control={form.control}
          render={({ field }) => (
            <MultiSelect
              {...field}
              searchable
              placeholder="Filtrer etter type"
              data={AuditLogTable.options.map((option) => ({
                label: option,
                value: option,
              }))}
            />
          )}
        />
        <Controller
          name="byOperation"
          control={form.control}
          render={({ field }) => (
            <MultiSelect
              {...field}
              searchable
              placeholder="Filtrer etter handling"
              data={AuditLogOperation.options.map((option) => ({
                label: option,
                value: option,
              }))}
            />
          )}
        />
      </Group>
    </form>
  )
}
