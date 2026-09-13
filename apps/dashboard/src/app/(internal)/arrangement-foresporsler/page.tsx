"use client"

import { useTRPC } from "@/lib/trpc-client"
import { Skeleton, Stack } from "@mantine/core"
import { useQueries } from "@tanstack/react-query"
import { EventRequestTable } from "./EventRequestTable"

export default function EventRequestsPage() {
  const trpc = useTRPC()

  const [
    { data: eventRequests, isLoading: isEventRequestsLoading },
    { data: interestGroups, isLoading: isInterestGroupsLoading },
  ] = useQueries({
    queries: [
      {
        ...trpc.event.findEventRequests.queryOptions({}),
        initialData: [],
      },
      {
        ...trpc.group.allByType.queryOptions("INTEREST_GROUP"),
        initialData: [],
      },
    ],
  })

  return (
    <Skeleton visible={isEventRequestsLoading || isInterestGroupsLoading}>
      <Stack>
        <EventRequestTable eventRequests={eventRequests} interestGroups={interestGroups} />
      </Stack>
    </Skeleton>
  )
}
