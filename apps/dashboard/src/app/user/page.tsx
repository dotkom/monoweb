"use client"

import { GenericTable } from "@/components/GenericTable"
import { Icon } from "@iconify/react"
import { Button, ButtonGroup, Skeleton, Stack } from "@mantine/core"
import { useUsersQuery } from "./components/UserSearch/queries"
import { useUserTable } from "./use-user-table"

export default function UserPage() {
  const { data: users, isLoading: isUsersLoading } = useUsersQuery()
  const table = useUserTable({ data: users })

  return (
    <Skeleton visible={isUsersLoading}>
      <Stack>
        <GenericTable table={table} />
        <ButtonGroup ml="auto">
          <Button variant="subtle">
            <Icon icon="tabler:caret-left" />
          </Button>
          <Button variant="subtle">
            <Icon icon="tabler:caret-right" />
          </Button>
        </ButtonGroup>
      </Stack>
    </Skeleton>
  )
}
