"use client"

import { NotificationsTable } from "@/app/(internal)/varslinger/components/notifications-table"
import { useNotificationsInfiniteQuery } from "@/app/(internal)/varslinger/queries"
import { Skeleton, Stack, Text } from "@mantine/core"
import type { FC } from "react"
import { useEventContext } from "./provider"

export const EventNotificationsPage: FC = () => {
  const { event } = useEventContext()
  const { notifications, isLoading, fetchNextPage } = useNotificationsInfiniteQuery({
    byLink: { type: "EVENT", eventId: event.id },
  })

  return (
    <Stack>
      <Text size="sm" c="dimmed">
        Sending av varslinger til påmeldte er midlertidig utilgjengelig. Bruk e-post fra Påmeldte-fanen.
      </Text>

      <Skeleton visible={isLoading}>
        <NotificationsTable notifications={notifications} onLoadMore={fetchNextPage} />
      </Skeleton>
    </Stack>
  )
}
