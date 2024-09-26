import type { User } from "@dotkomonline/types"
import { type FC, useState } from "react"
import { useSearchUsersQuery } from "../../../modules/user/queries"
import GenericSearch from "../../GenericSearch"

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
      dataMapper={(item: User) => `${item.email} - ${item.profile?.firstName} ${item.profile?.lastName}`}
      placeholder="Søk etter bruker..."
      resetOnClick
    />
  )
}
