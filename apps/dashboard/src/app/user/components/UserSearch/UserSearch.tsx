import { GenericSearch } from "@/components/GenericSearch"
import type { User } from "@dotkomonline/types"
import { type FC, useState } from "react"
import { useSearchUsersQuery } from "./queries"

interface UserSearchProps {
  onSubmit(data: User): void
}

export const UserSearch: FC<UserSearchProps> = ({ onSubmit }) => {
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
      items={users}
      dataMapper={(item: User) => `${item.email} ${item.firstName} ${item.lastName}`}
      placeholder="Søk etter bruker..."
      resetOnClick
    />
  )
}
