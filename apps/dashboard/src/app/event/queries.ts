import type { AttendanceId, EventFilterQuery, EventId, FeedbackFormId } from "@dotkomonline/types"
import { useQuery } from "@tanstack/react-query"

import { useTRPC } from "@/lib/trpc"
import type { Pageable } from "node_modules/@dotkomonline/rpc/src/query"

interface UseEventAllQueryProps {
  filter: EventFilterQuery
  page?: Pageable
}

export const useEventAllQuery = ({ filter, page }: UseEventAllQueryProps) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery({
    ...trpc.event.all.queryOptions({ filter, ...page }),
  })

  return { events: data?.items ?? [], ...query }
}

export const useEventDetailsGetQuery = (id: EventId) => {
  const trpc = useTRPC()
  return useQuery(trpc.event.get.queryOptions(id))
}

export const useAttendanceGetQuery = (id: AttendanceId, enabled?: boolean) => {
  const trpc = useTRPC()
  const { data, isLoading } = useQuery(
    trpc.event.attendance.getAttendance.queryOptions(
      {
        id,
      },
      {
        enabled,
      }
    )
  )
  return { data, isLoading }
}

export const useEventAttendeesGetQuery = (attendanceId: AttendanceId) => {
  const trpc = useTRPC()
  const { data: attendees, ...query } = useQuery({
    ...trpc.event.attendance.getAttendees.queryOptions({
      attendanceId,
    }),
    initialData: [],
  })
  return { attendees, ...query }
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
