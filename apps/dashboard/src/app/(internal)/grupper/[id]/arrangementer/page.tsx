"use client"

import { EventTable } from "@/app/(internal)/arrangementer/components/EventTable"
import { useEventAllInfiniteQuery } from "@/app/(internal)/arrangementer/queries"
import { Text, Title } from "@dotkomonline/ui"
import { useGroupDetailsContext } from "../provider"

export default function GroupArrangementerPage() {
  const { group } = useGroupDetailsContext()

  const { events, isLoading, isPlaceholderData, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useEventAllInfiniteQuery({
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

      <EventTable
        events={events}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage ?? false}
        fetchNextPage={fetchNextPage}
      />
    </div>
  )
}
