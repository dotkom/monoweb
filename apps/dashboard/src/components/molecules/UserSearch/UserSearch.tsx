import { useState, type FC } from "react"
import GenericSearch from "../../GenericSearch"
import { useSearchUsers } from "../../../modules/user/queries/use-user-get-query"
import { User } from "@dotkomonline/types"

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
