"use client"

import { PermissionTooltip } from "@/components/PermissionTooltip"
import { openSendNotificationModal } from "@/app/(internal)/varslinger/components/send-notification-modal"
import { NotificationsTable } from "@/app/(internal)/varslinger/components/notifications-table"
import { getEventLaunchContext } from "@/app/(internal)/varslinger/notification-launch-context"
import { useNotificationsInfiniteQuery } from "@/app/(internal)/varslinger/queries"
import { Button, Group, Skeleton, Stack } from "@mantine/core"
import type { FC } from "react"
import { useEventContext } from "./provider"

export const EventNotificationsPage: FC = () => {
  const { event, attendance } = useEventContext()
  const { notifications, isLoading, fetchNextPage } = useNotificationsInfiniteQuery({
    byLink: { type: "EVENT", eventId: event.id },
  })
  const hasAttendance = attendance !== null

  return (
    <Stack>
      <Group>
        <PermissionTooltip allowed={hasAttendance} label="Arrangementet har ingen påmelding">
          <Button
            disabled={!hasAttendance}
            onClick={() => {
              if (attendance === null) {
                return
              }

              openSendNotificationModal(getEventLaunchContext(event, attendance))
            }}
          >
            Send melding til påmeldte
          </Button>
        </PermissionTooltip>
      </Group>
      <Skeleton visible={isLoading}>
        <NotificationsTable notifications={notifications} onLoadMore={fetchNextPage} />
      </Skeleton>
    </Stack>
  )
}
