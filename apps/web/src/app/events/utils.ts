import type { Attendance } from "@dotkomonline/types"

type AttendanceRegisterStartAndEnd = Pick<Attendance, "registerStart" | "registerEnd">

type AttendanceDetails =
  | {
      status: "Open"
      timeUntilClose: number
    }
  | {
      status: "Closed"
      timeSinceClose: number
    }
  | {
      status: "NotOpened"
      timeUntilOpen: number
      timeUntilClose: number
    }

export const getAttendanceDetails = (
  registerStartAndEnd: AttendanceRegisterStartAndEnd,
  now = new Date()
): AttendanceDetails => {
  const { registerStart, registerEnd } = registerStartAndEnd

  if (now < registerStart) {
    return {
      status: "NotOpened",
      timeUntilOpen: registerStart.getTime() - now.getTime(),
      timeUntilClose: registerEnd.getTime() - now.getTime(),
    }
  }

  if (now > registerEnd) {
    return {
      status: "Closed",
      timeSinceClose: now.getTime() - registerEnd.getTime(),
    }
  }

  return {
    status: "Open",
    timeUntilClose: registerEnd.getTime() - now.getTime(),
  }
}
