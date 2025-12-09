import type { User } from "@dotkomonline/types"
import { type FC, useState } from "react"
import { GenericSearch } from "@/components/GenericSearch"
import { useUserAllQuery } from "../queries"

interface UserSearchProps {
  onSubmit(data: User): void
  excludeUserIds?: string[]
  placeholder?: string
}

export const UserSearch: FC<UserSearchProps> = ({ placeholder, onSubmit, excludeUserIds }) => {
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
      items={users.filter((user) => !excludeUserIds || !excludeUserIds.includes(user.id))}
      dataMapper={(item: User) => {
        if (item.name) {
          return `${item.name} (${item.email})`
        }
        return item.email ?? item.id
      }}
      placeholder={placeholder ?? "Søk etter bruker..."}
      resetOnClick
    />
  )
}
