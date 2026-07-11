"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { Box, Button, Skeleton, Stack } from "@mantine/core"
import { AllNotificationsTable } from "./all-notification-table"
import { useCreateNotificationModal } from "./modals/create-notification"
import { useNotificationAllInfiniteQuery } from "./queries"

export default function NotificationPage() {
  const { notifications, isLoading: isNotificationsLoading } = useNotificationAllInfiniteQuery()
  const open = useCreateNotificationModal()
  const { canManageNotifications } = useAuthorization()
  const canManage = canManageNotifications()

  return (
    <Skeleton visible={isNotificationsLoading}>
      <Stack>
        <Box>
          <PermissionTooltip
            allowed={canManage}
            label="Du har ikke tilgang til å opprette varslinger"
          >
            <Button onClick={open} disabled={!canManage}>
              Opprett varsling
            </Button>
          </PermissionTooltip>
        </Box>
        <AllNotificationsTable notifications={notifications} />
      </Stack>
    </Skeleton>
  )
}
