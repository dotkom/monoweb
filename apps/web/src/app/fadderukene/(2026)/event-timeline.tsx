import { getServerSession } from "@/auth"
import type { EventWithAttendance } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import { EventTimelineList } from "./event-timeline-list"

type EventTimelineProps = {
  eventsWithAttendance: EventWithAttendance[]
}

export async function EventTimeline({ eventsWithAttendance }: EventTimelineProps) {
  if (eventsWithAttendance.length === 0) {
    return <Text className="text-muted-foreground">Det er ingen kommende arrangementer.</Text>
  }

  const session = await getServerSession()
  const userId = session?.sub ?? null

  return <EventTimelineList eventsWithAttendance={eventsWithAttendance} userId={userId} />
}
