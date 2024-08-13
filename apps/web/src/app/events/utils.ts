import type { Attendance } from "@dotkomonline/types"

type ReturnType =
  | {
      status: "OPEN"
      timeUntilClose: Date
    }
  | {
      status: "CLOSED"
      timeElapsedSinceClose: Date
    }
  | {
      status: "NOT_OPENED"
      timeUtilOpen: Date
      timeUntilClose: Date
    }
export const getStructuredDateInfo = (attendance: Attendance, now: Date): ReturnType => {
  const registerStart = attendance.registerStart
  const registerEnd = attendance.registerEnd

  if (now < registerStart) {
    return {
      status: "NOT_OPENED",
      timeUtilOpen: new Date(registerStart.getTime() - now.getTime()),
      timeUntilClose: new Date(registerEnd.getTime() - now.getTime()),
    }
  }

  if (now > registerEnd) {
    return {
      status: "CLOSED",
      timeElapsedSinceClose: new Date(now.getTime() - registerEnd.getTime()),
    }
  }

  return {
    status: "OPEN",
    timeUntilClose: new Date(registerEnd.getTime() - now.getTime()),
  }
}
