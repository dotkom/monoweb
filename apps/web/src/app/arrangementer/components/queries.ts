import { useTRPC } from "@/utils/trpc/client"
import type { AttendanceId, EventFilterQuery, UserId } from "@dotkomonline/types"
import { skipToken, useInfiniteQuery } from "@tanstack/react-query"

import { useQuery } from "@tanstack/react-query"
import type { Pageable } from "node_modules/@dotkomonline/rpc/src/query"
import { useMemo } from "react"

interface Props {
  userId?: string
  attendanceId: string
}
export const useGetAttendee = ({ userId, attendanceId }: Props) => {
  const trpc = useTRPC()
  return useQuery(
    trpc.event.attendance.getAttendee.queryOptions(
      userId
        ? {
            attendanceId,
            userId: userId ?? "",
          }
        : skipToken
    )
  )
}

interface UseEventAllQueryProps {
  filter: EventFilterQuery
  page?: Pageable
}

export const useEventAllQuery = ({ filter, page }: UseEventAllQueryProps) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery({
    ...trpc.event.all.queryOptions({ filter, ...page }),
  })

  return { events: useMemo(() => data?.items ?? [], [data]), ...query }
}

export const useEventAllInfiniteQuery = ({ filter, page }: UseEventAllQueryProps) => {
  const trpc = useTRPC()

  const { data, ...query } = useInfiniteQuery({
    ...trpc.event.all.infiniteQueryOptions({
      filter,
      ...page,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const events = data?.pages.flatMap((page) => page.items) ?? []

  return { events, ...query }
}

type UseGetAttendeeStatusesQueryProps = {
  userId?: UserId
  attendanceIds: AttendanceId[]
}

export const useGetAttendeeStatusesQuery = ({ userId, attendanceIds }: UseGetAttendeeStatusesQueryProps) => {
  const trpc = useTRPC()

  return useQuery(
    trpc.attendance.getAttendeeStatuses.queryOptions(
      userId
        ? {
            userId,
            attendanceIds,
          }
        : skipToken
    )
  )
}
