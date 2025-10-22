import type { EventWithAttendance } from "@dotkomonline/types"
import type { EventCategoryKey } from "./eventTypeConfig"

export interface EventDisplayProps {
  startCol: number
  span: number
  leftEdge: boolean
  rightEdge: boolean
  active: boolean
  type?: EventCategoryKey
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
