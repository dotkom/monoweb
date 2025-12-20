import { Skeleton } from "@mantine/core"
import type { FC } from "react"
import { EventTable } from "@/app/(internal)/arrangementer/components/events-table"
import { useEventAllByAttendingUserInfiniteQuery } from "@/app/(internal)/arrangementer/queries"
import { useUserDetailsContext } from "./provider"

export const UserEventPage: FC = () => {
  const { user } = useUserDetailsContext()

  const { events, isLoading, fetchNextPage } = useEventAllByAttendingUserInfiniteQuery(user.id)

  return (
    <Skeleton visible={isLoading}>
      <EventTable events={events} onLoadMore={fetchNextPage} />
    </Skeleton>
  )
}
