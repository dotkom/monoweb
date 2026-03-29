"use client"

import { Box, Button, Skeleton, Stack } from "@mantine/core"
import { AllNotificationsTable } from "./all-notification-table"
import { useCreateNotificationModal } from "./modals/create-notification"
import { useNotificationAllInfiniteQuery } from "./queries"

export default function NotificationPage() {
  const { notifications, isLoading: isNotificationsLoading } = useNotificationAllInfiniteQuery()
  const open = useCreateNotificationModal()

  return (
    <Skeleton visible={isNotificationsLoading}>
      <Stack>
        <Box>
          <Button onClick={open}>Opprett varsling</Button>
        </Box>
        <AllNotificationsTable notifications={notifications} />
      </Stack>
    </Skeleton>
  )
}
