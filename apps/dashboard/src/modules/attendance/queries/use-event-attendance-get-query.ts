import { type AttendanceId } from "@dotkomonline/types"
import { trpc } from "../../../utils/trpc"

export const useEventAttendanceGetQuery = (id: AttendanceId) => {
  // pools kan være undefined - why?
  const { data: pools = [], ...query } = trpc.event.attendance.getPoolsByAttendanceId.useQuery({
    id,
  })
  return { pools, ...query }
}
