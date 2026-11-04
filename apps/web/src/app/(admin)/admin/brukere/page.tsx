"use client"

import type { UserFilterQuery } from "@dotkomonline/rpc/user"
import { Title } from "@dotkomonline/ui"
import { useState } from "react"
import { UserFilters } from "./components/UserFilters"
import { UserTable } from "./components/UserTable"
import { useUserAllInfiniteQuery } from "./queries"

export default function UserPage() {
  const [filter, setFilter] = useState<UserFilterQuery>({})
  const { users, isLoading, isPlaceholderData, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useUserAllInfiniteQuery({ filter })

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" className="text-4xl">
        Brukere
      </Title>

      <div className="flex flex-col gap-2">
        <UserFilters onChange={setFilter} />

        <UserTable
          users={users}
          isLoading={isLoading}
          isPlaceholderData={isPlaceholderData}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage ?? false}
          fetchNextPage={fetchNextPage}
        />
      </div>
    </div>
  )
}
