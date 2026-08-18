import { ActionIcon, Group, TextInput } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { IconX } from "@tabler/icons-react"
import { useEffect, useState } from "react"

interface Props {
  value: string
  onChange(searchTerm: string): void
}

export const EventFilters = ({ value, onChange }: Props) => {
  const [searchTerm, setSearchTerm] = useState(value)
  const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 300)

  useEffect(() => {
    setSearchTerm(value)
  }, [value])

  useEffect(() => {
    if (debouncedSearchTerm !== value) {
      onChange(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm, onChange, value])

  const hasSearchTerm = Boolean(searchTerm)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <Group gap={4}>
        <TextInput
          placeholder="Søk etter arrangementer..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
          style={{ width: 200 }}
          rightSection={
            hasSearchTerm && (
              <ActionIcon size="input-sm" variant="subtle" color="gray" type="reset" onClick={() => setSearchTerm("")}>
                <IconX size={16} />
              </ActionIcon>
            )
          }
        />
      </Group>
    </form>
  )
}
