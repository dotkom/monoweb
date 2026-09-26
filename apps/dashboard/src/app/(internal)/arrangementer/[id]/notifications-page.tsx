"use client"

import { NotificationsTable } from "@/app/(internal)/varslinger/components/NotificationsTable"
import { useNotificationsInfiniteQuery } from "@/app/(internal)/varslinger/queries"
import { Text } from "@dotkomonline/ui"
import type { FC } from "react"
import { useEventContext } from "./provider"

export const EventNotificationsPage: FC = () => {
  const { event } = useEventContext()
  const { notifications, isLoading, isPlaceholderData, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useNotificationsInfiniteQuery({
      byLink: { type: "EVENT", eventId: event.id },
    })

  return (
    <div className="flex flex-col gap-4">
      <Text className="text-sm text-muted-foreground">
        Sending av varslinger til påmeldte er midlertidig utilgjengelig. Bruk e-post fra Påmeldte-fanen.
      </Text>

      <NotificationsTable
        notifications={notifications}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isPlaceholderData={isPlaceholderData}
        isLoading={isLoading}
        dimReadOnlyRows
      />
    </div>
  )
}
