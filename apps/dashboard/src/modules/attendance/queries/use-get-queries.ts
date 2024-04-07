import { type AttendanceId } from "@dotkomonline/types"
import { trpc } from "../../../utils/trpc"

export const usePoolsGetQuery = (id: AttendanceId) => {
  const { data: pools = [], ...query } = trpc.event.attendance.getPoolsByAttendanceId.useQuery({
    id,
  })
  return { pools, ...query }
}

export const useAttendanceGetQuery = (id: AttendanceId, enabled?: boolean) => {
  const { data, isLoading } = trpc.event.attendance.getAttendance.useQuery(
    {
      id,
    },
    {
      enabled,
    }
  )
  return { data, isLoading }
}

export const useEventAttendeesGetQuery = (id: AttendanceId) => {
  const { data: attendees = [], ...query } = trpc.event.attendance.getAttendees.useQuery({
    id,
  })
  return { attendees, ...query }
}

export const useWaitlistAttendeesGetQuery = (id: AttendanceId) => {
  const { data: attendees = [], ...query } = trpc.attendance.getWaitlist.useQuery({
    id,
  })
  return { attendees, ...query }
}
