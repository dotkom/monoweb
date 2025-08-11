import type { AttendanceId, EventFilterQuery, EventId, FeedbackFormId } from "@dotkomonline/types"
import { useQuery } from "@tanstack/react-query"

import { useTRPC } from "@/lib/trpc"
import type { Pageable } from "node_modules/@dotkomonline/rpc/src/query"
import { useMemo } from "react"

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

export const useEventDetailsGetQuery = (id: EventId) => {
  const trpc = useTRPC()
  return useQuery(trpc.event.get.queryOptions(id))
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

export const useFeedbackAnswersGetQuery = (formId: FeedbackFormId) => {
  const trpc = useTRPC()
  return useQuery(trpc.event.feedback.getAllAnswers.queryOptions(formId))
}
