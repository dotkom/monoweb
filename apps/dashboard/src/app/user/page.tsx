"use client"

import { GenericTable } from "@/components/GenericTable"
import type { UserFilterQuery } from "@dotkomonline/types"
import { Group, Skeleton, Stack } from "@mantine/core"
import { useEffect, useRef, useState } from "react"
import { UserFilters } from "./components/user-filters"
import { useUserAllInfiniteQuery } from "./queries"
import { useUserTable } from "./use-user-table"

export default function UserPage() {
  const [filter, setFilter] = useState<UserFilterQuery>({})
  const { users, isLoading: isUsersLoading, fetchNextPage, hasNextPage } = useUserAllInfiniteQuery({ filter })

  const table = useUserTable({ data: users ?? [] })

  const loaderRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage) {
        fetchNextPage()
      }
    })

    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage])

  return (
    <Stack>
      <Group>
        <UserFilters onChange={setFilter} />
      </Group>
      <Skeleton visible={isUsersLoading}>
        <GenericTable table={table} />
      </Skeleton>
      <div ref={loaderRef} />
    </Stack>
  )
}
