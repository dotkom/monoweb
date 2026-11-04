import { tz } from "@date-fns/tz"
import { endOfDay, format, parseISO } from "date-fns"

export const EVENT_TIME_ZONE = "Europe/Oslo"

const eventTimeZone = tz(EVENT_TIME_ZONE)

export function getEventDateKey(date: Date) {
  return format(date, "yyyy-MM-dd", { in: eventTimeZone })
}

export function getEventDateRange(date: string) {
  const min = parseISO(date, { in: eventTimeZone })

  return { min, max: endOfDay(min) }
}
