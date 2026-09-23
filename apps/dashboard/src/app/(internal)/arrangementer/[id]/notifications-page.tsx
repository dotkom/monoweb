"use client"

import { NotificationsTable } from "@/app/(internal)/varslinger/components/notifications-table"
import { useNotificationsInfiniteQuery } from "@/app/(internal)/varslinger/queries"
import { Text } from "@dotkomonline/ui"
import type { FC } from "react"
import { useEventContext } from "./provider"

export const EventNotificationsPage: FC = () => {
  const { event } = useEventContext()
  const { notifications, isLoading, fetchNextPage, hasNextPage } = useNotificationsInfiniteQuery({
    byLink: { type: "EVENT", eventId: event.id },
  })

  return (
    <div className="flex flex-col gap-4">
      <Text className="text-sm text-muted-foreground">
        Sending av varslinger til påmeldte er midlertidig utilgjengelig. Bruk e-post fra Påmeldte-fanen.
      </Text>
      {isLoading ? (
        <div className="h-40 w-full animate-pulse rounded-sm bg-muted" />
      ) : (
        <NotificationsTable
          notifications={notifications}
          onLoadMore={hasNextPage ? fetchNextPage : undefined}
          dimReadOnlyRows
        />
      )}
    </div>
  )
}
