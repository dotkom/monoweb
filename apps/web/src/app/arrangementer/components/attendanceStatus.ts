import type { Attendance, AttendanceStatus } from "@dotkomonline/types"

type AttendanceRegisterStartAndEnd = Pick<Attendance, "registerStart" | "registerEnd">

export const getAttendanceStatus = (
  registerStartAndEnd: AttendanceRegisterStartAndEnd,
  now = new Date()
): AttendanceStatus => {
  const { registerStart, registerEnd } = registerStartAndEnd

  if (now < registerStart) {
    return "NotOpened"
  }

  if (now > registerEnd) {
    return "Closed"
  }

  return "Open"
}
