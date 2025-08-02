"use client"
import { Box, Button, Skeleton, Stack } from "@mantine/core"
import { AllGroupsTable } from "./all-groups-table"
import { useCreateGroupModal } from "./modals/create-group-modal"
import { useGroupAllQuery } from "./queries"

const GroupPage = () => {
  const { groups, isLoading: isGroupsLoading } = useGroupAllQuery()
  const open = useCreateGroupModal()

  return (
    <Skeleton visible={isGroupsLoading}>
      <Stack>
        <Box>
          <Button onClick={open}>Opprett gruppe</Button>
        </Box>
        <AllGroupsTable groups={groups} />
      </Stack>
    </Skeleton>
  )
}

export default GroupPage
