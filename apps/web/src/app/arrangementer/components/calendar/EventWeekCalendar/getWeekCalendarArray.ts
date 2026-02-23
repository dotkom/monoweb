import type { EventWithAttendanceSummary } from "@dotkomonline/types"
import { compareAsc, setISOWeek, setISOWeekYear, startOfISOWeek } from "date-fns"
import type { EventDisplayProps, WeekData } from "../types"

export function getWeekCalendarArray(year: number, weekNumber: number, events: EventWithAttendanceSummary[]): WeekData {
  // get date in the target ISO week
  let weekDate = new Date()
  weekDate = setISOWeekYear(weekDate, year)
  weekDate = setISOWeek(weekDate, weekNumber)

  const weekStart = startOfISOWeek(weekDate)

  // generate 7 dates of the week
  const dates: Date[] = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + i)
    return day
  })

  // sort events by start date
  const sortedEvents = [...events].sort((a, b) => compareAsc(a.event.start, b.event.start))

  // initialize week data
  const weekData: WeekData = {
    dates,
    eventDetails: [],
    year,
    weekNumber,
  }

  const completedEvents: string[] = []
  const slotMatrix: (number | null)[][] = []

  // place events in the week matrix
  for (const [dayIndex, day] of dates.entries()) {
    for (const { event, attendance } of sortedEvents) {
      if (!completedEvents.includes(event.id)) {
        const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59)
        const startOfNextWeek = new Date(dates[6])
        startOfNextWeek.setDate(startOfNextWeek.getDate() + 1)

        // Check if the current day falls within the event's date range
        if (event.start <= dayEnd && event.end >= day) {
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
              weekData.eventDetails.push([])
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
              weekData.eventDetails[row].push({ ...{ event, attendance }, eventDisplayProps })
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

  return weekData
}
