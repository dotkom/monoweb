import type { Attendance } from "@dotkomonline/types"

type AttendanceRegisterStartAndEnd = Pick<Attendance, "registerStart" | "registerEnd">

enum AttendanceStatusStatus {
  Open = "OPEN",
  Closed = "CLOSED",
  NotOpened = "NOT_OPENED",
}

type AttendanceStatus =
  | {
      status: AttendanceStatusStatus.Open
      timeUntilClose: number
    }
  | {
      status: AttendanceStatusStatus.Closed
      timeSinceClose: number
    }
  | {
      status: AttendanceStatusStatus.NotOpened
      timeUntilOpen: number
      timeUntilClose: number
    }

export const getAttendanceStatus = (
  registerStartAndEnd: AttendanceRegisterStartAndEnd,
  now: Date
): AttendanceStatus => {
  const { registerStart, registerEnd } = registerStartAndEnd

  if (now < registerStart) {
    return {
      status: AttendanceStatusStatus.NotOpened,
      timeUntilOpen: registerStart.getTime() - now.getTime(),
      timeUntilClose: registerEnd.getTime() - now.getTime(),
    }
  }

  if (now > registerEnd) {
    return {
      status: AttendanceStatusStatus.Closed,
      timeSinceClose: now.getTime() - registerEnd.getTime(),
    }
  }

  return {
    status: AttendanceStatusStatus.Open,
    timeUntilClose: registerEnd.getTime() - now.getTime(),
  }
}
