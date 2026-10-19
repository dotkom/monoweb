import type { ContestId } from "@dotkomonline/rpc/contest"
import type { EventWithAttendanceView } from "@dotkomonline/rpc/event"
import { addWeeks, interval, subMonths } from "date-fns"

export type FadderukePageProps = {
  parentEventWithAttendance: EventWithAttendanceView | null
  childEventsWithAttendance: EventWithAttendanceView[]
  contestId: ContestId | null
}

export const getFadderukeActiveInterval = (parentEventStart: Date, parentEventEnd: Date) => {
  const start = subMonths(parentEventStart, 3)
  const end = addWeeks(parentEventEnd, 2)

  return interval(start, end)
}
