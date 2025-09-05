import type { EventWithAttendance } from "@dotkomonline/types"
import { compareAsc } from "date-fns"
import type { CalendarData, EventDisplayProps, Week } from "./types"

export function getCalendarArray(year: number, month: number, events: EventWithAttendance[]): CalendarData {
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  const firstWeekday = firstDayOfMonth.getDay() || 7
  const lastWeekDay = lastDayOfMonth.getDay() || 7
  const prevMonthLastDay = new Date(year, month, 0).getDate()

  const sortedEvents = [...events].sort((a, b) => compareAsc(a.event.start, b.event.start))

  const cal: CalendarData = { weeks: [], year, month }
  const days: Date[] = []

  // first week padded with last days of previous month
  for (let i = 2 - firstWeekday; i <= 0; i++) {
    const day = new Date(year, month - 1, prevMonthLastDay + i)
    days.push(day)
  }

  // add the days of the current month
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const day = new Date(year, month, i)
    days.push(day)
  }

  // last week padding with first days of next month
  for (let i = 1; i <= 7 - lastWeekDay; i++) {
    const day = new Date(year, month + 1, i)
    days.push(day)
  }

  // split into chunks of 7 and build the 'cal' object
  for (let i = 0; i < days.length; i += 7) {
    const week: Week = {
      dates: days.slice(i, i + 7),
      eventDetails: [],
    }

    const completedEvents: string[] = []
    const slotMatrix: (number | null)[][] = []

    for (const [dayIndex, day] of week.dates.entries()) {
      for (const { event, attendance } of sortedEvents) {
        if (!completedEvents.includes(event.id)) {
          const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59)

          // Check if the current day falls within the event's date range
          if (event.start <= dayEnd && event.end >= day) {
            const startOfNextWeek = new Date(week.dates[6])
            startOfNextWeek.setDate(startOfNextWeek.getDate() + 1)

            const span = event.end >= startOfNextWeek ? 7 - dayIndex : ((event.end.getDay() + 6) % 7) - dayIndex + 1

            const now = new Date()

            const eventDisplayProps: EventDisplayProps = {
              startCol: dayIndex,
              span,
              leftEdge: event.start >= day,
              rightEdge: event.end < startOfNextWeek,
              active: event.end > now,
            }

            let row = 0
            let placed = false

            // add new row if needed
            while (!placed) {
              if (row >= slotMatrix.length) {
                slotMatrix.push(Array(7).fill(null))
                week.eventDetails.push([])
              }

              let canPlaceEvent = true

              // check if there is space for the event
              for (let i = eventDisplayProps.startCol; i < eventDisplayProps.startCol + eventDisplayProps.span; i++) {
                if (slotMatrix[row][i] !== null) {
                  canPlaceEvent = false
                  break
                }
              }

              // if there is space add the event and mark the slots as taken (1)
              if (canPlaceEvent) {
                for (let i = eventDisplayProps.startCol; i < eventDisplayProps.startCol + eventDisplayProps.span; i++) {
                  slotMatrix[row][i] = 1
                }
                week.eventDetails[row].push({ event, attendance, eventDisplayProps })
                completedEvents.push(event.id)
                placed = true
              } else {
                // if the event could not be placed check next row
                row++
              }
            }
          }
        }
      }
    }

    cal.weeks.push(week)
  }

  return cal
}
