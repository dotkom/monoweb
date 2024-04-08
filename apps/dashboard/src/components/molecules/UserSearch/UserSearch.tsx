import type { User } from "@dotkomonline/types"
import { type FC, useState } from "react"
import { useSearchUsers } from "../../../modules/user/queries/use-user-get-query"
import GenericSearch from "../../GenericSearch"

interface UserSearchProps {
  onSubmit(data: User): void
}

export const UserSearch: FC<UserSearchProps> = ({ onSubmit }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const { users } = useSearchUsers(searchQuery)

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
      dataMapper={(item: User) => `${item.name}`}
      placeholder="Søk etter bruker..."
      resetOnClick
    />
  )
}
