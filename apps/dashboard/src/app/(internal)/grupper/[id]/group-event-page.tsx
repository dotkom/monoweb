import { Skeleton } from "@mantine/core"
import type { FC } from "react"
import { EventTable } from "@/app/(internal)/arrangementer/components/events-table"
import { useEventAllInfiniteQuery } from "@/app/(internal)/arrangementer/queries"
import { useGroupDetailsContext } from "./provider"

export const GroupEventPage: FC = () => {
  const { group } = useGroupDetailsContext()

  const { events, isLoading, fetchNextPage, isFetchingNextPage } = useEventAllInfiniteQuery({
    filter: {
      byOrganizingGroup: [group.slug],
    },
  })

  return (
    <Skeleton visible={isLoading}>
      <EventTable events={events} onLoadMore={fetchNextPage} isLoading={isLoading} isLoadingMore={isFetchingNextPage} />
    </Skeleton>
  )
}
