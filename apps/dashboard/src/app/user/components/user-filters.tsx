import type { UserFilterQuery } from "@dotkomonline/types"
import { TextInput } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"

interface Props {
  onChange(filters: UserFilterQuery): void
}

interface FormProps {
  search: string
}

export const UserFilters = ({ onChange }: Props) => {
  const form = useForm<FormProps>()
  const data = useWatch(form) as FormProps
  const [debouncedData] = useDebouncedValue(data, 300)

  useEffect(() => {
    onChange({
      byName: debouncedData.search,
      byEmail: debouncedData.search,
    })
  }, [onChange, debouncedData])

  return (
    <form>
      <TextInput placeholder="Søk etter bruker..." {...form.register("search")} />
    </form>
  )
}
