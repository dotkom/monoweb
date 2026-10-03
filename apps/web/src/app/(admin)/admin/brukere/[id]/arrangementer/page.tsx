"use client"

import { EventTable } from "@dashboard/app/arrangementer/components/EventTable"
import { useEventAllByAttendingUserInfiniteQuery } from "@dashboard/app/arrangementer/queries"
import { Title } from "@dotkomonline/ui"
import { useUserDetailsContext } from "../provider"

export default function UserEventsPage() {
  const { user } = useUserDetailsContext()

  const { events, isLoading, isPlaceholderData, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useEventAllByAttendingUserInfiniteQuery(user.id)

  return (
    <div className="flex flex-col gap-4">
      <Title element="h2" className="text-2xl font-semibold">
        Arrangementer
      </Title>
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
