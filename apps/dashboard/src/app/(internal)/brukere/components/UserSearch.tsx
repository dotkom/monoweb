"use client"

import type { User } from "@dotkomonline/rpc/user"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@dotkomonline/ui"
import { useMemo, useState } from "react"
import { useUserAllQuery } from "../queries"

function formatUserLabel(user: User) {
  if (user.name) {
    return `${user.name} (${user.email})`
  }

  return user.email ?? user.id
}

type UserSearchProps = {
  onSubmit: (data: User) => void
  excludeUserIds?: string[]
  placeholder?: string
  disabled?: boolean
}

export function UserSearch({ placeholder, onSubmit, excludeUserIds, disabled }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false)

  const { users, isLoading } = useUserAllQuery({
    filter: {
      byName: searchQuery,
      byEmail: searchQuery,
    },
    shouldKeepPreviousData: true,
  })

  const items = useMemo(() => users.filter((user) => !excludeUserIds?.includes(user.id)), [users, excludeUserIds])

  return (
    <Combobox
      open={open}
      onOpenChange={setOpen}
      disabled={disabled}
      items={items}
      value={null}
      onValueChange={(user: User | null) => {
        if (!user) {
          return
        }

        setSearchQuery("")
        setOpen(false)
        onSubmit(user)
      }}
      inputValue={searchQuery}
      onInputValueChange={setSearchQuery}
      itemToStringLabel={(user: User) => formatUserLabel(user)}
      isItemEqualToValue={(a: User, b: User) => a.id === b.id}
    >
      <ComboboxInput placeholder={placeholder ?? "Søk etter bruker..."} />
      <ComboboxContent>
        <ComboboxEmpty>{isLoading ? "Laster brukere..." : "Ingen brukere funnet"}</ComboboxEmpty>
        <ComboboxList>
          {(user: User) => (
            <ComboboxItem key={user.id} value={user}>
              {formatUserLabel(user)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
