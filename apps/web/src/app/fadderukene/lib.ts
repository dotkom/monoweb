import type { EventId, EventWithAttendance } from "@dotkomonline/types"
import { addWeeks, interval, subMonths } from "date-fns"
import type { ComponentType } from "react"

export type FadderukePageProps = {
  parentEventWithAttendance: EventWithAttendance | null
}

export type FadderukeEntry = {
  parentEventId: EventId
  page: ComponentType<FadderukePageProps>
}

export const getFadderukeActiveInterval = (parentEventStart: Date, parentEventEnd: Date) => {
  const start = subMonths(parentEventStart, 3)
  const end = addWeeks(parentEventEnd, 2)

  return interval(start, end)
}
