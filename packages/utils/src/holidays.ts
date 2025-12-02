import { TZDate } from "@date-fns/tz"
import { addDays, addYears, differenceInDays, getYear, type Interval, interval, isWithinInterval } from "date-fns"
import { getCurrentUTC } from "./utc"

const JANUARY = 0 as const
const JUNE = 5 as const
const AUGUST = 7 as const
const DECEMBER = 11 as const

function getHolidaysThisYear(): Interval[] {
  const now = getCurrentUTC()
  const currentYear = getYear(now)
  const nextYear = getYear(addYears(now, 1))

  return [
    interval(new TZDate(currentYear, JUNE, 6), new TZDate(currentYear, AUGUST, 15)),
    interval(new TZDate(currentYear, DECEMBER, 19), new TZDate(nextYear, JANUARY, 6)),
  ]
}

// If the mark lasts over a holiday, it is not extended. I think that is fine,
// as really long marks should probably not take into account holidays.
export function getPunishmentExpiryDate(startDate: Date, durationDays: number) {
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
