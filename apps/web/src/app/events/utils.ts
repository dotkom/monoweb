import type { Attendance } from "@dotkomonline/types"

interface DateString {
  value: string
  isRelative: boolean
}
// todo: move out of file
export const dateToString = (attendanceOpeningDate: Date): DateString => {
  // todo: move out of scope
  const THREE_DAYS_MS = 259_200_000
  const ONE_DAY_MS = 86_400_000
  const ONE_HOUR_MS = 3_600_000
  const ONE_MINUTE_MS = 60_000
  const ONE_SECOND_MS = 1_000

  const now = new Date().getTime()
  const dateDifference = attendanceOpeningDate.getTime() - now

  if (Math.abs(dateDifference) > THREE_DAYS_MS) {
    const formatter = new Intl.DateTimeFormat("nb-NO", {
      day: "numeric",
      month: "long",
      weekday: "long",
    })

    // "mandag 12. april"
    const value = formatter.format(attendanceOpeningDate)

    return { value, isRelative: false }
  }

  const days = Math.floor(Math.abs(dateDifference) / ONE_DAY_MS)
  const hours = Math.floor((Math.abs(dateDifference) % ONE_DAY_MS) / ONE_HOUR_MS)
  const minutes = Math.floor((Math.abs(dateDifference) % ONE_HOUR_MS) / ONE_MINUTE_MS)
  const seconds = Math.floor((Math.abs(dateDifference) % ONE_MINUTE_MS) / ONE_SECOND_MS)

  let value = "nå"

  if (days > 0) {
    value = `${days} dag${days === 1 ? "" : "er"}`
  } else if (hours > 0) {
    value = `${hours} time${hours === 1 ? "" : "r"}`
  } else if (minutes > 0) {
    value = `${minutes} minutt${minutes === 1 ? "" : "er"}`
  } else if (seconds > 0) {
    value = `${seconds} sekund${seconds === 1 ? "" : "er"}`
  }

  return { value, isRelative: true }
}

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
