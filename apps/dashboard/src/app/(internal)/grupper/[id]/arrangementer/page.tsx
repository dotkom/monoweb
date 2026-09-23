"use client"

import { EventTable } from "@/app/(internal)/arrangementer/components/events-table"
import { useEventAllInfiniteQuery } from "@/app/(internal)/arrangementer/queries"
import { Text, Title } from "@dotkomonline/ui"
import { useGroupDetailsContext } from "../provider"

export default function GroupArrangementerPage() {
  const { group } = useGroupDetailsContext()

  const { events, isLoading, fetchNextPage } = useEventAllInfiniteQuery({
    filter: {
      byOrganizingGroup: [group.slug],
    },
  })

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Title>Arrangementer</Title>
        <Text>Dette er en oversikt over hvilke arrangementer som er tilknyttet denne gruppen.</Text>
      </div>

      {isLoading && events.length === 0 ? (
        <div className="h-105 w-full animate-pulse rounded-sm bg-gray-300 dark:bg-stone-700" />
      ) : (
        <EventTable events={events} onLoadMore={fetchNextPage} />
      )}
    </div>
  )
}
