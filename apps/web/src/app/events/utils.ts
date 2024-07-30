import type { Attendance } from "@dotkomonline/types"

interface DateToStringOptions {
  absolute: {
    capitalize?: boolean
    excludeYear?: boolean
    force?: boolean
    includeWeekday?: boolean
  }
  relative: {
    capitalize?: boolean
    force?: boolean
  }
}

interface DateString {
  value: string
  isRelative: boolean
  inPast: boolean
}

const ONE_YEAR_MS = 31_536_000_000
const THREE_DAYS_MS = 259_200_000
const ONE_DAY_MS = 86_400_000
const ONE_HOUR_MS = 3_600_000
const ONE_MINUTE_MS = 60_000
const ONE_SECOND_MS = 1_000

const capitalizeFirstLetter = (value: string): string => {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Converts a date to a string representation
 * @param date - The date to convert
 * @param options - Options for the conversion
 * @returns The string representation of the date
 * @example
 * const date = Date.now()
 * formatDate(date) // "nå"
 * formatDate(date, { relative: { capitalize: true } }) // "Nå"
 * formatDate(date, { absolute: { force: true, capitalize: true } }) // "Fredag 17. mai 2023"
 *
 * const inOneWeek = new Date(date.getTime() + 604_800_000)
 * formatDate(inOneWeek) // "fredag 24. mai"
 * formatDate(inOneWeek, { relative: { force: true } }) // "7 dager"
 * formatDate(inOneWeek, { relative: { force: true , capitalize: true } }) // "7 dager"
 */
export const formatDate = (date: Date, options?: DateToStringOptions): DateString => {
  const now = new Date().getTime()
  const timeDifference = date.getTime() - now

  const shouldForceAbsolute = options?.absolute.force && !options?.relative.force
  const isBeyondThreshold = Math.abs(timeDifference) > THREE_DAYS_MS

  if (shouldForceAbsolute || (isBeyondThreshold && !options?.relative.force)) {
    return formatDateToAbsoluteString(date, options, timeDifference)
  }
  return formatDateToRelativeString(options, timeDifference)
}

const formatDateToAbsoluteString = (
  date: Date,
  options: DateToStringOptions | undefined,
  timeDifference: number
): DateString => {
  const weekdayOption = options?.absolute.includeWeekday ? "long" : undefined
  const yearOption = options?.absolute.excludeYear ? undefined : "numeric"

  const formatter = new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "long",
    weekday: weekdayOption,
    year: yearOption,
  })

  const inPast = timeDifference < 0
  let value = formatter.format(date)

  if (options?.absolute.capitalize) {
    value = capitalizeFirstLetter(value)
  }

  return { value, isRelative: false, inPast }
}

const formatDateToRelativeString = (options: DateToStringOptions | undefined, timeDifference: number): DateString => {
  const inPast = timeDifference < 0

  const years = Math.floor(Math.abs(timeDifference) / ONE_YEAR_MS)
  const days = Math.floor((Math.abs(timeDifference) % ONE_YEAR_MS) / ONE_DAY_MS)
  const hours = Math.floor((Math.abs(timeDifference) % ONE_DAY_MS) / ONE_HOUR_MS)
  const minutes = Math.floor((Math.abs(timeDifference) % ONE_HOUR_MS) / ONE_MINUTE_MS)
  const seconds = Math.floor((Math.abs(timeDifference) % ONE_MINUTE_MS) / ONE_SECOND_MS)

  let value = options?.relative.capitalize ? "Nå" : "nå"

  if (years > 0) {
    value = `${years} år`
  } else if (days > 0) {
    value = `${days} dag${days === 1 ? "" : "er"}`
  } else if (hours > 0) {
    value = `${hours} time${hours === 1 ? "" : "r"}`
  } else if (minutes > 0) {
    value = `${minutes} minutt${minutes === 1 ? "" : "er"}`
  } else if (seconds > 0) {
    value = `${seconds} sekund${seconds === 1 ? "" : "er"}`
  }

  return { value, isRelative: true, inPast }
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
