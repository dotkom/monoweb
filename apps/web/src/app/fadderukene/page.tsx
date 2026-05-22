import { getCurrentUTC } from "@dotkomonline/utils"
import { GenericFadderukenePage } from "./generic-fadderukene-page"
import { server } from "@/utils/trpc/server"
import { isWithinInterval } from "date-fns"
import { type FadderukeEntry, getFadderukeActiveInterval } from "./lib"
import { Fadderukene2026Page } from "./(2026)/fadderukene-2026-page"

const EVENTS = {
  "2026": {
    parentEventId: "bd67bc32-debd-46cb-bb06-1213e36be05d",
    page: Fadderukene2026Page,
  },
} satisfies Record<`${number}`, FadderukeEntry>

export default async function FadderukenePage() {
  const now = getCurrentUTC()
  const currentYear = now.getFullYear().toString() as keyof typeof EVENTS
  const eventEntry = EVENTS[currentYear] ?? null

  if (eventEntry === null) {
    return <GenericFadderukenePage />
  }

  const parentEventId = eventEntry.parentEventId
  const Event = eventEntry.page

  const [parentEvent, childEvents] = await Promise.all([
    server.event.find.query(parentEventId),
    server.event.findChildEvents.query({ eventId: parentEventId }),
  ])

  if (parentEvent === null) {
    return <GenericFadderukenePage />
  }

  const timeAllocation = getFadderukeActiveInterval(parentEvent.event.start, parentEvent.event.end)

  if (!isWithinInterval(now, timeAllocation)) {
    return <GenericFadderukenePage />
  }

  return <Event parentEventWithAttendance={parentEvent} childEventsWithAttendance={childEvents} />
}
