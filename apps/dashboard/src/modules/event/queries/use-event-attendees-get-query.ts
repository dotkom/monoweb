import { type AttendanceId } from "@dotkomonline/types"
import { trpc } from "../../../utils/trpc"

export const useEventAttendeesGetQuery = (id: AttendanceId) => {
  const { data: attendees = [], ...query } = trpc.event.attendance.getAttendees.useQuery({
    id,
  })
  return { attendees, ...query }
}
