import { useTRPC } from "@/utils/trpc/client"
import type { AttendanceId, EventFilterQuery, UserId } from "@dotkomonline/types"
import { skipToken, useInfiniteQuery } from "@tanstack/react-query"

import { useQuery } from "@tanstack/react-query"
import type { Pageable } from "node_modules/@dotkomonline/rpc/src/query"

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
export const useEventAllPagedQuery = ({ filter, page }: UseEventAllQueryProps) => {
  const trpc = useTRPC()

  const { data, ...query } = useInfiniteQuery({
    ...trpc.event.allPaged.infiniteQueryOptions({
      filter,
      ...page,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const events = data?.pages.flatMap((page) => page.items) ?? []

  return { events, ...query }
}

type UseGetAttendeeStatuses = {
  userId?: UserId
  attendanceIds: AttendanceId[]
}

export const useGetAttendeeStatusesQuery = ({ userId, attendanceIds }: UseGetAttendeeStatuses) => {
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
