import type { Attendance, AttendanceStatus } from "@dotkomonline/types"

type AttendanceRegisterStartAndEnd = Pick<Attendance, "registerStart" | "registerEnd">

export const getAttendanceStatus = (
  registerStartAndEnd: AttendanceRegisterStartAndEnd,
  now = new Date()
): AttendanceStatus => {
  const { registerStart, registerEnd } = registerStartAndEnd

  if (now < registerStart) {
    return "NOT_OPENED"
  }

  if (now > registerEnd) {
    return "CLOSED"
  }

  return "OPEN"
}
