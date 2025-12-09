"use client"

import type { UserFilterQuery } from "@dotkomonline/types"
import { Group, Skeleton, Stack } from "@mantine/core"
import { useState } from "react"
import { GenericTable } from "@/components/GenericTable"
import { UserFilters } from "./components/user-filters"
import { useUserAllInfiniteQuery } from "./queries"
import { useUserTable } from "./use-user-table"

export default function UserPage() {
  const [filter, setFilter] = useState<UserFilterQuery>({})
  const { users, isLoading: isUsersLoading, fetchNextPage } = useUserAllInfiniteQuery({ filter })

  const table = useUserTable({ data: users })

  return (
    <Stack>
      <Group>
        <UserFilters onChange={setFilter} />
      </Group>
      <Skeleton visible={isUsersLoading}>
        <GenericTable table={table} onLoadMore={fetchNextPage} />
      </Skeleton>
    </Stack>
  )
}
