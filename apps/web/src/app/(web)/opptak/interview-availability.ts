import { tz } from "@date-fns/tz"
import {
  COMMITTEE_APPLICATION_TIME_ZONE,
  getInterviewWindow,
  type CommitteeApplicationInterviewAvailability,
  type CommitteeApplicationOpenPeriod,
} from "@dotkomonline/rpc/committee-application"
import { addDays, format, parseISO, startOfDay, isSameDay } from "date-fns"
import { nb } from "date-fns/locale"

const norwegianTimeContext = { in: tz(COMMITTEE_APPLICATION_TIME_ZONE) }

export function getInterviewDateRange(applicationPeriod: CommitteeApplicationOpenPeriod) {
  // Prisma date-only fields represent calendar dates at midnight UTC.
  return {
    start: format(applicationPeriod.interviewsStartDate, "yyyy-MM-dd", { in: tz("UTC") }),
    lastDay: format(applicationPeriod.interviewsEndDate, "yyyy-MM-dd", { in: tz("UTC") }),
    end: format(addDays(applicationPeriod.interviewsEndDate, 1, { in: tz("UTC") }), "yyyy-MM-dd", { in: tz("UTC") }),
  }
}

export function parseInterviewAvailability(date: string, startsAt: string, endsAt: string) {
  return {
    startsAt: new Date(parseISO(`${date}T${startsAt}`, norwegianTimeContext)),
    endsAt: new Date(parseISO(`${date}T${endsAt}`, norwegianTimeContext)),
  }
}

export function getApplicationInterviewWindows(applicationPeriod: CommitteeApplicationOpenPeriod) {
  const dateRange = getInterviewDateRange(applicationPeriod)
  const utcTimeContext = { in: tz("UTC") }
  const end = parseISO(dateRange.end, utcTimeContext)
  const windows: CommitteeApplicationInterviewAvailability[] = []
  let date = parseISO(dateRange.start, utcTimeContext)

  while (date < end) {
    const calendarDate = format(date, "yyyy-MM-dd", utcTimeContext)
    windows.push(
      parseInterviewAvailability(
        calendarDate,
        applicationPeriod.interviewsStartTime,
        applicationPeriod.interviewsEndTime
      )
    )
    date = addDays(date, 1, utcTimeContext)
  }

  return windows
}

export function getCalendarAvailability(startsAt: Date, endsAt: Date): CommitteeApplicationInterviewAvailability {
  return { startsAt: new Date(startsAt), endsAt: new Date(endsAt) }
}

export function mergeInterviewAvailability(
  currentAvailability: CommitteeApplicationInterviewAvailability[],
  addedAvailability: CommitteeApplicationInterviewAvailability
) {
  const sortedAvailability = [...currentAvailability, addedAvailability].sort(
    (first, second) => first.startsAt.getTime() - second.startsAt.getTime()
  )
  const mergedAvailability: CommitteeApplicationInterviewAvailability[] = []

  for (const availability of sortedAvailability) {
    const previousAvailability = mergedAvailability.at(-1)

    if (previousAvailability !== undefined && availability.startsAt <= previousAvailability.endsAt) {
      previousAvailability.endsAt = new Date(
        Math.max(previousAvailability.endsAt.getTime(), availability.endsAt.getTime())
      )
    } else {
      mergedAvailability.push({ ...availability })
    }
  }

  return mergedAvailability
}

export function formatCalendarTime(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss")
}

export function formatInterviewAvailability(availability: CommitteeApplicationInterviewAvailability) {
  const startsAt = format(availability.startsAt, "EEEE d. MMMM, 'kl.' HH:mm", { locale: nb })
  const endsAt = format(
    availability.endsAt,
    isSameDay(availability.startsAt, availability.endsAt) ? "HH:mm" : "EEEE d. MMMM, 'kl.' HH:mm",
    { locale: nb }
  )
  return `${startsAt}–${endsAt}`
}

export function normalizeInterviewIntervals(intervals: CommitteeApplicationInterviewAvailability[]) {
  const merged = intervals.reduce<CommitteeApplicationInterviewAvailability[]>((result, interval) => {
    return mergeInterviewAvailability(result, interval)
  }, [])

  return merged.flatMap((interval) => {
    const days: CommitteeApplicationInterviewAvailability[] = []
    let startsAt = interval.startsAt

    while (startsAt < interval.endsAt) {
      const dayEnd = getInterviewWindow(startsAt).endsAt
      const endsAt = new Date(Math.min(dayEnd.getTime(), interval.endsAt.getTime()))
      days.push({ startsAt, endsAt })
      startsAt = endsAt
    }

    return days
  })
}

export function subtractInterviewIntervals(
  windows: CommitteeApplicationInterviewAvailability[],
  exclusions: CommitteeApplicationInterviewAvailability[]
) {
  let remaining = normalizeInterviewIntervals(windows)

  for (const exclusion of normalizeInterviewIntervals(exclusions)) {
    remaining = remaining.flatMap((interval) => {
      if (exclusion.endsAt <= interval.startsAt || exclusion.startsAt >= interval.endsAt) {
        return [interval]
      }

      const pieces: CommitteeApplicationInterviewAvailability[] = []

      if (exclusion.startsAt > interval.startsAt) {
        pieces.push({ startsAt: interval.startsAt, endsAt: exclusion.startsAt })
      }

      if (exclusion.endsAt < interval.endsAt) {
        pieces.push({ startsAt: exclusion.endsAt, endsAt: interval.endsAt })
      }

      return pieces
    })
  }

  return remaining
}

export function getAvailableInterviewHours(intervals: CommitteeApplicationInterviewAvailability[]) {
  const milliseconds = normalizeInterviewIntervals(intervals).reduce((total, interval) => {
    return total + interval.endsAt.getTime() - interval.startsAt.getTime()
  }, 0)

  return milliseconds / 3_600_000
}

export function getInterviewCalendarBounds(windows: CommitteeApplicationInterviewAvailability[]) {
  const intervals = getLocalInterviewWindows(windows)
  const starts = intervals.map((interval) => format(interval.startsAt, "HH:mm:ss"))
  const ends = intervals.map((interval) => {
    const time = format(interval.endsAt, "HH:mm:ss")

    return time === "00:00:00" ? "24:00:00" : time
  })

  return {
    slotMinTime: starts.sort().at(0) ?? "09:00:00",
    slotMaxTime: ends.sort().at(-1) ?? "17:00:00",
  }
}

// Split at local midnight for calendars in timezones where an Oslo window spans two dates.
export function getLocalInterviewWindows(windows: CommitteeApplicationInterviewAvailability[]) {
  return windows.flatMap((window) => {
    const intervals: CommitteeApplicationInterviewAvailability[] = []
    let startsAt = window.startsAt

    while (startsAt < window.endsAt) {
      const nextDay = addDays(startOfDay(startsAt), 1)
      const endsAt = new Date(Math.min(nextDay.getTime(), window.endsAt.getTime()))
      intervals.push({ startsAt, endsAt })
      startsAt = endsAt
    }

    return intervals
  })
}

export function getLocalInterviewDateRange(windows: CommitteeApplicationInterviewAvailability[]) {
  const start = windows[0].startsAt
  const lastDay = new Date(windows[windows.length - 1].endsAt.getTime() - 1)

  return {
    start: format(start, "yyyy-MM-dd"),
    lastDay: format(lastDay, "yyyy-MM-dd"),
    end: format(addDays(startOfDay(lastDay), 1), "yyyy-MM-dd"),
  }
}

export function parseLocalInterviewAvailability(date: string, startsAt: string, endsAt: string) {
  return { startsAt: parseISO(`${date}T${startsAt}`), endsAt: parseISO(`${date}T${endsAt}`) }
}
