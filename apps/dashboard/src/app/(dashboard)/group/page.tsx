"use client"
import { Box, Button, Skeleton, Stack } from "@mantine/core"
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
        <Box>
          <Button onClick={open}>Opprett gruppe</Button>
        </Box>
        <GenericTable table={table} />
      </Stack>
    </Skeleton>
  )
}

export default GroupPage
