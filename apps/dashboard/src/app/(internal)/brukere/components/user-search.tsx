import { GenericSearch } from "@/components/GenericSearch"
import type { User } from "@dotkomonline/rpc/user"
import { type FC, useState } from "react"
import { useUserAllQuery } from "../queries"

interface UserSearchProps {
  onSubmit(data: User): void
  excludeUserIds?: string[]
  placeholder?: string
  disabled?: boolean
}

export const UserSearch: FC<UserSearchProps> = ({ placeholder, onSubmit, excludeUserIds, disabled }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const { users } = useUserAllQuery({
    filter: {
      byName: searchQuery,
      byEmail: searchQuery,
    },
  })

  const handleUserSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <GenericSearch
      onSearch={handleUserSearch}
      onSubmit={(user) => {
        setSearchQuery("")
        onSubmit(user)
      }}
      items={users.filter((user) => !excludeUserIds?.includes(user.id))}
      dataMapper={(item: User) => {
        if (item.name) {
          return `${item.name} (${item.email})`
        }
        return item.email ?? item.id
      }}
      placeholder={placeholder ?? "Søk etter bruker..."}
      resetOnClick
      disabled={disabled}
    />
  )
}
