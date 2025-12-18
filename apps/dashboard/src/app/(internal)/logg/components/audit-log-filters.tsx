import type { AuditLogFilterQuery } from "@dotkomonline/types"
import { TextInput } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"

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
      <TextInput placeholder="Søk etter hendelse..." {...form.register("bySearchTerm")} />
    </form>
  )
}
