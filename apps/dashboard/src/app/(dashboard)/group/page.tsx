"use client"
import { Button, Card, Group, Skeleton, Stack } from "@mantine/core"
import { GenericTable } from "src/components/GenericTable"
import { useCreateGroupModal } from "src/modules/group/modals/create-group-modal"
import { useGroupAllQuery } from "src/modules/group/queries/use-group-all-query"
import { useGroupTable } from "src/modules/group/use-group-table"

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
