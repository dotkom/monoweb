import { GenericSearch } from "@/components/GenericSearch"
import type { User } from "@dotkomonline/types"
import { type FC, useState } from "react"
import { useSearchUsersQuery } from "./queries"

interface UserSearchProps {
  onSubmit(data: User): void
  excludeUserIds?: string[]
}

export const UserSearch: FC<UserSearchProps> = ({ onSubmit, excludeUserIds }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: users } = useSearchUsersQuery(searchQuery)

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
      dataMapper={(item: User) => `${item.email} ${item.firstName ?? ""} ${item.lastName ?? ""}`}
      placeholder="Søk etter bruker..."
      resetOnClick
    />
  )
}
