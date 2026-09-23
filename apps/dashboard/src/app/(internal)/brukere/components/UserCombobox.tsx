"use client"

import { useUserAllQuery } from "@/app/(internal)/brukere/queries"
import type { User } from "@dotkomonline/rpc/user"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  Label,
  useComboboxAnchor,
} from "@dotkomonline/ui"
import { useEffect, useMemo, useState } from "react"

export type UserMemberOption = {
  id: string
  name: string
}

function toMemberOption(user: User): UserMemberOption {
  return {
    id: user.id,
    name: user.name || user.email || user.id,
  }
}

type UserComboboxProps = {
  label?: string
  placeholder?: string
  description?: string
  disabled?: boolean
  required?: boolean
  value: UserMemberOption[]
  onChange: (members: UserMemberOption[]) => void
  excludeUserIds?: string[]
}

export function UserCombobox({
  label,
  placeholder,
  description,
  disabled,
  required,
  value,
  onChange,
  excludeUserIds,
}: UserComboboxProps) {
  const anchor = useComboboxAnchor()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 200)

    return () => {
      clearTimeout(timeout)
    }
  }, [searchQuery])

  const { users, isLoading } = useUserAllQuery({
    filter: {
      byName: debouncedSearch,
      byEmail: debouncedSearch,
    },
    shouldKeepPreviousData: true,
  })

  const excluded = useMemo(() => {
    const set = new Set(excludeUserIds ?? [])
    for (const member of value) {
      set.delete(member.id)
    }
    return set
  }, [excludeUserIds, value])

  const selectedIds = useMemo(() => new Set(value.map((member) => member.id)), [value])

  const items = useMemo(() => {
    const fromSearch = users.filter((user) => !excluded.has(user.id) && !selectedIds.has(user.id)).map(toMemberOption)

    const selectedNotInSearch = value.filter((member) => !fromSearch.some((item) => item.id === member.id))

    return [...selectedNotInSearch, ...fromSearch]
  }, [users, excluded, selectedIds, value])

  return (
    <Combobox
      multiple
      disabled={disabled}
      required={required}
      items={items}
      value={value}
      onValueChange={(next: UserMemberOption[]) => {
        onChange(next)
      }}
      inputValue={searchQuery}
      onInputValueChange={setSearchQuery}
      filter={null}
      itemToStringLabel={(member: UserMemberOption) => member.name}
      isItemEqualToValue={(a: UserMemberOption, b: UserMemberOption) => a.id === b.id}
    >
      <div className="flex flex-col gap-3">
        {label && (
          <Label>
            {label}
            {required && <span className="text-red-600 dark:text-red-400"> *</span>}
          </Label>
        )}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        <ComboboxChips ref={anchor} className="h-auto min-h-9">
          <ComboboxValue>
            {(selected: UserMemberOption[]) => (
              <>
                {selected.map((member) => (
                  <ComboboxChip key={member.id}>{member.name}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  placeholder={selected.length === 0 ? (placeholder ?? "Søk etter bruker...") : ""}
                  disabled={disabled}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
      </div>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>{isLoading ? "Laster..." : "Ingen brukere funnet"}</ComboboxEmpty>
        <ComboboxList>
          {(member: UserMemberOption) => (
            <ComboboxItem key={member.id} value={member}>
              {member.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
