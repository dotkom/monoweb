"use client"

import { useUserAllQuery } from "@/app/(internal)/brukere/queries"
import type { User } from "@dotkomonline/types"
import { MultiSelect, type MultiSelectProps, Select } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { useMemo, useState } from "react"

export type UserMemberOption = {
  id: string
  name: string
}

const formatUserLabel = (user: User): string => {
  return user.name || user.email || user.id
}

const inputFilter: NonNullable<MultiSelectProps["filter"]> = ({ options }) => options

type UserComboboxBaseProps = Pick<MultiSelectProps, "label" | "placeholder" | "description" | "disabled" | "required">

export type UserComboboxSingleProps = UserComboboxBaseProps & {
  multiselect?: false | undefined
  value: UserMemberOption | null
  onChange: (member: UserMemberOption | null) => void
  excludeUserIds?: string[]
}

export type UserComboboxMultiProps = UserComboboxBaseProps & {
  multiselect: true
  value: UserMemberOption[]
  onChange: (members: UserMemberOption[]) => void
  excludeUserIds?: string[]
}

export type UserComboboxProps = UserComboboxSingleProps | UserComboboxMultiProps

export function UserCombobox(props: UserComboboxProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebouncedValue(search, 200)

  const { users, isLoading } = useUserAllQuery({
    filter: {
      byName: debouncedSearch,
      byEmail: debouncedSearch,
    },
  })

  const excluded = useMemo(() => new Set(props.excludeUserIds ?? []), [props.excludeUserIds])

  const data = useMemo(() => {
    if (props.multiselect) {
      const members = props.value
      const selectedIds = new Set(members.map((member) => member.id))

      const selectedOptions = members.map((member) => ({
        value: member.id,
        label: member.name,
      }))

      const fromSearch = users
        .filter((user) => !excluded.has(user.id) && !selectedIds.has(user.id))
        .map((user) => ({
          value: user.id,
          label: formatUserLabel(user),
        }))

      return [...selectedOptions, ...fromSearch]
    }

    const fromSearch = users
      .filter((user) => !excluded.has(user.id))
      .map((user) => ({
        value: user.id,
        label: formatUserLabel(user),
      }))

    const current = props.value

    if (current !== null && !fromSearch.some((option) => option.value === current.id)) {
      return [{ value: current.id, label: current.name }, ...fromSearch]
    }

    return fromSearch
  }, [props.multiselect, props.value, users, excluded])

  const sharedInputProps = {
    comboboxProps: { withinPortal: true } as const,
    data,
    description: props.description,
    disabled: props.disabled,
    filter: inputFilter,
    label: props.label,
    nothingFoundMessage: isLoading ? "Laster..." : "Ingen brukere funnet",
    onSearchChange: setSearch,
    placeholder: props.placeholder,
    required: props.required,
    searchValue: search,
    searchable: true,
  }

  if (props.multiselect) {
    const handleMultiChange = (ids: string[]) => {
      const previousById = new Map(props.value.map((member) => [member.id, member.name]))

      const nextMembers = ids.map((id) => {
        const fromResults = users.find((user) => user.id === id)
        const labelText = fromResults ? formatUserLabel(fromResults) : (previousById.get(id) ?? id)

        return {
          id,
          name: labelText,
        }
      })

      props.onChange(nextMembers)
    }

    return (
      <MultiSelect {...sharedInputProps} onChange={handleMultiChange} value={props.value.map((member) => member.id)} />
    )
  }

  const handleSingleChange = (id: string | null) => {
    if (id === null) {
      props.onChange(null)
      return
    }

    const fromResults = users.find((user) => user.id === id)
    const previous = props.value?.id === id ? props.value : null
    const name = fromResults ? formatUserLabel(fromResults) : (previous?.name ?? id)

    props.onChange({ id, name })
  }

  return <Select {...sharedInputProps} clearable onChange={handleSingleChange} value={props.value?.id ?? null} />
}
