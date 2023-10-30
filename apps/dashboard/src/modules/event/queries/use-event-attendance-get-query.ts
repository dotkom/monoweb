import { trpc } from "../../../utils/trpc"
import { EventId } from "@dotkomonline/types"

export const useEventAttendanceGetQuery = (eventId: EventId) => {
  const { data: eventAttendance = [], ...query } = trpc.event.attendance.get.useQuery({
    eventId,
  })
  return { eventAttendance, ...query }
}
