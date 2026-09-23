"use client"

import type { FC } from "react"
import { EventTable } from "@/app/(internal)/arrangementer/components/EventTable"
import { useEventAllByAttendingUserInfiniteQuery } from "@/app/(internal)/arrangementer/queries"
import { Title } from "@dotkomonline/ui"
import { useUserDetailsContext } from "./provider"

export const UserEventPage: FC = () => {
  const { user } = useUserDetailsContext()

  const { events, isLoading, isPlaceholderData, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useEventAllByAttendingUserInfiniteQuery(user.id)

  return (
    <div className="flex flex-col gap-4">
      <Title className="text-2xl">Arrangementer</Title>
      {isLoading && events.length === 0 ? (
        <div className="h-105 w-full animate-pulse rounded-sm bg-gray-300 dark:bg-stone-700" />
      ) : (
        <EventTable
          events={events}
          isLoading={isLoading}
          isPlaceholderData={isPlaceholderData}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage ?? false}
          fetchNextPage={fetchNextPage}
        />
      )}
    </div>
  )
}
