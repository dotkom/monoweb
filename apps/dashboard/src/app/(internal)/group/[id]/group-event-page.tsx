import { Skeleton } from "@mantine/core"
import type { FC } from "react"
import { EventTable } from "../../event/components/events-table"
import { useEventAllInfiniteQuery } from "../../event/queries"
import { useGroupDetailsContext } from "./provider"

export const GroupEventPage: FC = () => {
  const { group } = useGroupDetailsContext()

  const { events, isLoading, fetchNextPage } = useEventAllInfiniteQuery({
    filter: {
      byOrganizingGroup: [group.slug],
    },
  })

  return (
    <Skeleton visible={isLoading}>
      <EventTable events={events} onLoadMore={fetchNextPage} />
    </Skeleton>
  )
}
