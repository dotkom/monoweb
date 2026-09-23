import { TZDate, tz } from "@date-fns/tz"
import { format, formatDistanceStrict, isBefore, isValid, set, subDays, subHours } from "date-fns"
import { nb } from "date-fns/locale"

const NORWAY_TIMEZONE = "Europe/Oslo"
const norwayTimezone = tz(NORWAY_TIMEZONE)

export function getDefaultAttendanceDates(eventStart: Date) {
  const eventStartInNorway = new TZDate(eventStart, NORWAY_TIMEZONE)

  const registerStart = set(
    subDays(eventStartInNorway, 7, { in: norwayTimezone }),
    {
      hours: 12,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    },
    { in: norwayTimezone }
  )

  const registerEnd = subHours(eventStartInNorway, 1, { in: norwayTimezone })

  const deregisterDeadline = set(
    subDays(eventStartInNorway, 2, { in: norwayTimezone }),
    {
      hours: 12,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    },
    { in: norwayTimezone }
  )

  return {
    registerStart,
    registerEnd,
    deregisterDeadline,
  }
}

export function formatEventScheduleDate(date: Date): string {
  return format(new TZDate(date, NORWAY_TIMEZONE), "eeee dd. MMMM yyyy 'kl.' HH:mm", { locale: nb })
}

export function formatRelativeToEventStart(date: Date | undefined, eventStart: Date): string | null {
  if (date === undefined || !isValid(date)) {
    return null
  }

  if (date.getTime() === eventStart.getTime()) {
    return "Samtidig som arrangementstart"
  }

  const distance = formatDistanceStrict(date, eventStart, { locale: nb })

  if (isBefore(date, eventStart)) {
    return `${distance} før arrangementstart`
  }

  return `${distance} etter arrangementstart`
}

export function formatRegistrationDuration(
  registerStart: Date | undefined,
  registerEnd: Date | undefined
): string | null {
  if (registerStart === undefined || registerEnd === undefined) {
    return null
  }

  if (!isValid(registerStart) || !isValid(registerEnd) || !isBefore(registerStart, registerEnd)) {
    return null
  }

  const distance = formatDistanceStrict(registerStart, registerEnd, { locale: nb })
  return `${distance} lang påmelding`
}
