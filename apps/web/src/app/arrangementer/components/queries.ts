import { useTRPC } from "@/utils/trpc/client"
import type { AttendanceId, EventFilterQuery, UserId } from "@dotkomonline/types"
import { getCurrentUtc } from "@dotkomonline/utils"
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

  const { data, ...query } = useInfiniteQuery({
    ...trpc.event.all.infiniteQueryOptions({
      filter,
      ...page,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const events = data?.pages.flatMap(page => page.items) ?? []

  return { events, ...query }
}

export const useFutureEventAllQuery = () => {
  const trpc = useTRPC()

  const now = useMemo(() => getCurrentUtc(), [])

  const { data, ...query } = useQuery({
    ...trpc.event.all.queryOptions({
      filter: {
        byEndDate: {
          max: now,
          min: null,
        },
      },
      // TODO why
      take: 1000,
    }),
  })

  return { data, ...query }
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
