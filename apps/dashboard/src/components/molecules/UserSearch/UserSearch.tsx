import { type UserIDP } from "@dotkomonline/types"
import { useState, type FC } from "react"
import { trpc } from "../../../utils/trpc"
import GenericSearch from "../../GenericSearch"

interface UserSearchProps {
  onSubmit(data: UserIDP): void
}

export const UserSearch: FC<UserSearchProps> = ({ onSubmit }) => {
  const [searchQuery, setSearchQuery] = useState("")

  const { data: usersFromIdp = [] } = trpc.user.searchUsersFromIDP.useQuery(
    { searchQuery },
    {
      enabled: searchQuery.length > 1,
    }
  )

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
      items={usersFromIdp}
      dataMapper={(item: UserIDP) => `${item.givenName} ${item.familyName}`}
      placeholder="Søk etter bruker..."
      resetOnClick
    />
  )
}
