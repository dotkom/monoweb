"use client"
import { GenericTable } from "@/components/GenericTable"
import { Button, Card, Group, Skeleton, Stack } from "@mantine/core"
import { useCreateGroupModal } from "./modals/create-group-modal"
import { useGroupAllQuery } from "./queries/use-group-all-query"
import { useGroupTable } from "./use-group-table"

const GroupPage = () => {
  const { groups, isLoading: isGroupsLoading } = useGroupAllQuery()
  const open = useCreateGroupModal()
  const table = useGroupTable({ data: groups })
  return (
    <Skeleton visible={isGroupsLoading}>
      <Stack>
        <Card withBorder>
          <GenericTable table={table} />
        </Card>
        <Group justify="space-between">
          <Button onClick={open}>Opprett gruppe</Button>
        </Group>
      </Stack>
    </Skeleton>
  )
}

export default GroupPage
