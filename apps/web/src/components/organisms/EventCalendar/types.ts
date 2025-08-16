import type { EventWithAttendance } from "@dotkomonline/types"

export interface EventDisplayProps {
  startCol: number
  span: number
  leftEdge: boolean
  rightEdge: boolean
  active: boolean
}

export interface Week {
  dates: Date[]
  eventDetails: (EventWithAttendance & { eventDisplayProps: EventDisplayProps })[][]
}

export interface CalendarData {
  weeks: Week[]
  year: number
  month: number
}
