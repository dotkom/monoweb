import { getCurrentUTC } from "@dotkomonline/utils"
import { GenericFadderukenePage } from "./generic-fadderukene-page"
import { server } from "@/utils/trpc/server"
import { isWithinInterval } from "date-fns"
import { type FadderukeEntry, type FadderukePageProps, getFadderukeActiveInterval } from "./lib"

// TODO: Delete this component once a real fadderuke page is implemented
const PlaceholderFadderukenePage = ({ parentEventWithAttendance }: FadderukePageProps) => {
  return (
    <div>
      TemporaryFadderukenePage
      {parentEventWithAttendance?.event.title}
    </div>
  )
}

// TODO: Remove the placeholder event once a real fadderuke page is implemented
const EVENTS = {
  "2000": {
    parentEventId: "00000000-0000-0000-0000-000000000000",
    page: PlaceholderFadderukenePage,
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

  const parentEvent = await server.event.find.query(parentEventId)

  if (parentEvent === null) {
    return <GenericFadderukenePage />
  }

  const timeAllocation = getFadderukeActiveInterval(parentEvent.event.start, parentEvent.event.end)

  if (!isWithinInterval(now, timeAllocation)) {
    return <GenericFadderukenePage />
  }

  return <Event parentEventWithAttendance={parentEvent} />
}
