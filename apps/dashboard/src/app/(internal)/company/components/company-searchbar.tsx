import { ActionIcon, Group, TextInput } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { IconX } from "@tabler/icons-react"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"

interface CompanyFilterQuery {
  bySearchTerm?: string | null
}

interface Props {
  onChange(filters: CompanyFilterQuery): void
}

export const CompanySearchBar = ({ onChange }: Props) => {
  const form = useForm<CompanyFilterQuery>()
  const data = useWatch(form) as CompanyFilterQuery
  const [debouncedData] = useDebouncedValue(data, 300)

  useEffect(() => {
    onChange(debouncedData)
  }, [onChange, debouncedData])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <Group gap={4}>
        <TextInput placeholder="Søk etter bedriftsnavn..." {...form.register("bySearchTerm")} />
        {Boolean(data.bySearchTerm) && (
          <ActionIcon
            size="input-sm"
            variant="subtle"
            color="gray"
            type="reset"
            onClick={() => form.resetField("bySearchTerm")}
          >
            <IconX size={16} />
          </ActionIcon>
        )}
      </Group>
    </form>
  )
}
