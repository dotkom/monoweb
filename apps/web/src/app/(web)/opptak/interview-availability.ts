import { tz } from "@date-fns/tz"
import {
  COMMITTEE_APPLICATION_INTERVIEW_HOURS,
  type CommitteeApplicationInterviewAvailability,
  type CommitteeApplicationOpenPeriod,
} from "@dotkomonline/rpc/committee-application"
import { addDays, format, parseISO } from "date-fns"
import { nb } from "date-fns/locale"

const norwegianTimeContext = { in: tz(COMMITTEE_APPLICATION_INTERVIEW_HOURS.timeZone) }

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

export function getCalendarAvailability(startsAt: Date, endsAt: Date): CommitteeApplicationInterviewAvailability {
  // FullCalendar v6 without a timezone plugin returns Norwegian wall times in UTC-coerced Dates.
  return {
    startsAt: new Date(parseISO(startsAt.toISOString().slice(0, 19), norwegianTimeContext)),
    endsAt: new Date(parseISO(endsAt.toISOString().slice(0, 19), norwegianTimeContext)),
  }
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
  return format(date, "yyyy-MM-dd'T'HH:mm:ss", norwegianTimeContext)
}

export function formatInterviewAvailability(availability: CommitteeApplicationInterviewAvailability) {
  const startsAt = format(availability.startsAt, "EEEE d. MMMM, HH:mm", { ...norwegianTimeContext, locale: nb })
  const endsAt = format(availability.endsAt, "HH:mm", norwegianTimeContext)
  return `${startsAt}–${endsAt}`
}
