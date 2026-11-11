import { TZDate, tzOffset } from "@date-fns/tz"
import { createPlugin } from "@fullcalendar/core"
import { NamedTimeZoneImpl } from "@fullcalendar/core/internal"

// Keep FullCalendar callbacks as real instants, even outside the browser's timezone.
class DateFnsTimeZone extends NamedTimeZoneImpl {
  offsetForArray([year, month, day, hours = 0, minutes = 0, seconds = 0, milliseconds = 0]: number[]) {
    const date = new TZDate(year, month, day, hours, minutes, seconds, milliseconds, this.timeZoneName)

    return tzOffset(this.timeZoneName, date)
  }

  timestampToArray(timestamp: number) {
    const date = new TZDate(timestamp, this.timeZoneName)

    return [
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds(),
    ]
  }
}

export const dateFnsTimeZonePlugin = createPlugin({
  name: "date-fns-time-zone",
  namedTimeZonedImpl: DateFnsTimeZone,
})
