import { TZDate } from "@date-fns/tz"
import { type Interval, addDays, differenceInDays, interval, isWithinInterval } from "date-fns"

const MONTHS = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
} as const

function getHolidaysThisYear(): Interval[] {
  const yearToday = new Date().getFullYear()

  return [
    interval(new TZDate(yearToday, MONTHS.june, 6), new TZDate(yearToday, MONTHS.august, 15)),
    interval(new TZDate(yearToday, MONTHS.december, 19), new TZDate(yearToday + 1, MONTHS.january, 6)),
  ]
}

// If the mark lasts over a holiday, it is not extended. I think that is fine,
// as really long marks should probably not take into account holidays.
export function getExpiryDate(startDate: Date, durationDays: number) {
  let endDate = addDays(startDate, durationDays)

  const holidays = getHolidaysThisYear()

  for (const holiday of holidays) {
    if (isWithinInterval(startDate, holiday)) {
      const holidayDaysLeft = differenceInDays(holiday.end, startDate)

      endDate = addDays(endDate, holidayDaysLeft)
    } else if (isWithinInterval(endDate, holiday)) {
      const holidayDuration = differenceInDays(holiday.end, holiday.start)

      endDate = addDays(endDate, holidayDuration)
    }
  }

  return endDate
}
