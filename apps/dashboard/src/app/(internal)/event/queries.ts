import type { AttendanceId, EventFilterQuery, EventId, FeedbackFormId } from "@dotkomonline/types"
import { type SkipToken, useInfiniteQuery, useQuery } from "@tanstack/react-query"

import { useTRPC } from "@/lib/trpc-client"
import type { Pageable } from "node_modules/@dotkomonline/rpc/src/query"
import { useMemo } from "react"

interface UseEventAllQueryProps {
  filter: EventFilterQuery
  page?: Pageable
}

export const useEventAllQuery = ({ filter, page }: UseEventAllQueryProps) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery({
    ...trpc.event.all.queryOptions({
      filter: {
        ...filter,
        excludingType: [],
        byStatus: ["PUBLIC", "DRAFT"],
      },
      ...page,
    }),
  })

  return { events: useMemo(() => data?.items ?? [], [data]), ...query }
}

export const useEventAllInfiniteQuery = ({ filter, page }: UseEventAllQueryProps) => {
  const trpc = useTRPC()
  const { data, ...query } = useInfiniteQuery({
    ...trpc.event.all.infiniteQueryOptions({
      filter: {
        ...filter,
        excludingType: [],
        byStatus: ["PUBLIC", "DRAFT"],
      },
      ...page,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  return { events: useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]), ...query }
}

export const useEventWithAttendancesGetQuery = (id: EventId, enabled?: boolean) => {
  const trpc = useTRPC()
  return useQuery(trpc.event.get.queryOptions(id, { enabled }))
}

export const useAttendanceGetQuery = (id: AttendanceId, enabled?: boolean) => {
  const trpc = useTRPC()
  const { data: attendees, isLoading } = useQuery(
    trpc.event.attendance.getAttendance.queryOptions(
      {
        id,
      },
      {
        enabled,
      }
    )
  )
  return { data: attendees, isLoading }
}

export const useEventFeedbackFormGetQuery = (eventId: EventId) => {
  const trpc = useTRPC()
  return useQuery(trpc.event.feedback.findFormByEventId.queryOptions(eventId))
}

export const useEventFeedbackPublicResultsTokenGetQuery = (formId: FeedbackFormId) => {
  const trpc = useTRPC()
  return useQuery(trpc.event.feedback.getPublicResultsToken.queryOptions(formId))
}

export const useFeedbackAnswersGetQuery = (formId: FeedbackFormId | SkipToken) => {
  const trpc = useTRPC()
  return useQuery(trpc.event.feedback.getAllAnswers.queryOptions(formId))
}
