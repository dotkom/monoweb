import { type Interval, addDays, differenceInDays, isWithinInterval } from "date-fns"

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
    // Summer holiday - June 6th to August 15th
    {
      start: new Date(yearToday, MONTHS.june, 6),
      end: new Date(yearToday, MONTHS.august, 15),
    },
    // Christmas holiday - December 19th to January 6th next year
    {
      start: new Date(yearToday, MONTHS.december, 19),
      end: new Date(yearToday + 1, MONTHS.january, 6),
    },
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
