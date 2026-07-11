"use client"
import { useAuthorization } from "@/auth/authorization-context"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { Box, Button, Skeleton, Stack } from "@mantine/core"
import { AllGroupsTable } from "./all-groups-table"
import { useCreateGroupModal } from "./modals/create-group-modal"
import { useGroupAllQuery } from "./queries"

const GroupPage = () => {
  const { groups, isLoading: isGroupsLoading } = useGroupAllQuery()
  const open = useCreateGroupModal()
  const { canCreateGroup } = useAuthorization()
  const canCreate = canCreateGroup("COMMITTEE") || canCreateGroup("INTEREST_GROUP")

  return (
    <Skeleton visible={isGroupsLoading}>
      <Stack>
        <Box>
          <PermissionTooltip allowed={canCreate}>
            <Button onClick={open} disabled={!canCreate}>
              Opprett gruppe
            </Button>
          </PermissionTooltip>
        </Box>
        <AllGroupsTable groups={groups} />
      </Stack>
    </Skeleton>
  )
}

export default GroupPage
