import { getCurrentUTC } from "@dotkomonline/utils"
import { GenericFadderukenePage } from "./generic-fadderukene-page"
import { server } from "@/utils/trpc/server"
import { isWithinInterval } from "date-fns"
import type { ComponentType } from "react"
import { type FadderukePageProps, getFadderukeActiveInterval } from "./lib"
import { Fadderukene2026Page } from "./(2026)/fadderukene-2026-page"

const PAGES = {
  "2026": Fadderukene2026Page,
} satisfies Record<`${number}`, ComponentType<FadderukePageProps>>

export default async function FadderukenePage() {
  const now = getCurrentUTC()
  const currentYear = now.getFullYear()
  const Page = PAGES[currentYear.toString() as keyof typeof PAGES] ?? null

  if (Page === null) {
    return <GenericFadderukenePage />
  }

  const fadderuke = await server.fadderuke.findByYear.query(currentYear)

  if (fadderuke === null) {
    return <GenericFadderukenePage />
  }

  const parentEventId = fadderuke.eventId

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

  return (
    <Page
      parentEventWithAttendance={parentEvent}
      childEventsWithAttendance={childEvents}
      contestId={parentEvent.event.contestId}
    />
  )
}
