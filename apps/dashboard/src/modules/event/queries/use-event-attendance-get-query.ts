import type { EventId } from "@dotkomonline/types"
import { trpc } from "../../../utils/trpc"

export const useEventAttendanceGetQuery = (eventId: EventId) => {
  const { data: eventAttendance = [], ...query } = trpc.event.attendance.get.useQuery({
    eventId,
  })
  return { eventAttendance, ...query }
}
