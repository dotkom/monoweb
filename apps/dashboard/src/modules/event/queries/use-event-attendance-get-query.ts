import { type AttendanceId } from "@dotkomonline/types"
import { trpc } from "../../../utils/trpc"

export const useEventAttendanceGetQuery = (id: AttendanceId) => {
  const { data: pools, ...query } = trpc.event.attendance.dashboardInfoPage.useQuery({
    id,
  })
  return { pools, ...query }
}
