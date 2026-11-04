import type { Attendance, AttendanceStatus } from "@dotkomonline/rpc/attendance"
import { isAfter, isBefore } from "date-fns"
type AttendanceRegisterStartAndEnd = Pick<Attendance, "registerStart" | "registerEnd">

export const getAttendanceStatus = (
  registerStartAndEnd: AttendanceRegisterStartAndEnd,
  now = new Date()
): AttendanceStatus => {
  const { registerStart, registerEnd } = registerStartAndEnd

  if (isBefore(now, registerStart)) {
    return "NOT_OPENED"
  }

  if (isAfter(now, registerEnd)) {
    return "CLOSED"
  }

  return "OPEN"
}
