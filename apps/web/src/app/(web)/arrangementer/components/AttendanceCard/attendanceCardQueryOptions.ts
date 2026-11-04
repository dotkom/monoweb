import type { useTRPC } from "@/utils/trpc/client"
import type { AttendanceView } from "@dotkomonline/rpc/attendance"
import { queryOptions } from "@tanstack/react-query"

export function attendanceCardQueryOptions(trpc: ReturnType<typeof useTRPC>, attendanceId: string) {
  const options = trpc.event.attendance.getAttendance.queryOptions({ id: attendanceId })
  const queryFn = options.queryFn

  if (typeof queryFn !== "function") {
    throw new Error("Attendance queries require a query function")
  }

  // Keep summary attendees separate from the full attendance cache used by the admin pages.
  return queryOptions<AttendanceView>({
    queryKey: [...options.queryKey, "card"],
    queryFn: (context) =>
      queryFn({
        ...context,
        queryKey: options.queryKey,
      }),
  })
}
