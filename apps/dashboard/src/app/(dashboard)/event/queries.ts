import type { AttendanceId, EventId } from "@dotkomonline/types"
import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "../../../trpc"

export const useEventAllQuery = () => {
  const trpc = useTRPC()
  const { data: events, ...query } = useQuery({
    ...trpc.event.all.queryOptions(),
    initialData: [],
  })
  return { events, ...query }
}

export const useEventCompanyGetQuery = (id: EventId) => {
  const trpc = useTRPC()
  const { data: eventCompanies, ...query } = useQuery({
    ...trpc.event.company.get.queryOptions({
      id,
    }),
    initialData: [],
  })
  return { eventCompanies, ...query }
}

export const useEventDetailsGetQuery = (id: EventId) => {
  const trpc = useTRPC()

  return useQuery(trpc.event.getEventDetail.queryOptions(id))
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
  return useQuery(trpc.event.feedbackForm.getByEventId.queryOptions(eventId))
}
