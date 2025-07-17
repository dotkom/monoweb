import { auth } from "@/auth"
import { EventListItem } from "@/components/molecules/EventListItem/EventListItem"
import { server } from "@/utils/trpc/server"
import type { AttendanceEvent, AttendanceId } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import { isPast } from "date-fns"
import type { FC } from "react"

const mapEventDetailToItem = (
  attendanceStatuses: Map<AttendanceId, "RESERVED" | "UNRESERVED"> | null,
  attendanceEvent: AttendanceEvent
) => {
  const attendeeStatus = attendanceStatuses?.get(attendanceEvent.attendance?.id ?? "") ?? null

  return <EventListItem attendanceEvent={attendanceEvent} attendeeStatus={attendeeStatus} key={attendanceEvent.id} />
}

interface EventListProps {
  attendanceEvents: AttendanceEvent[]
}

export const EventList: FC<EventListProps> = async (props: EventListProps) => {
  if (props.attendanceEvents.length === 0) {
    return (
      <Text className="text-gray-800 dark:text-stone-400 text-sm">
        Det er ingen arrangementer å vise. Kom tilbake senere for oppdateringer.
      </Text>
    )
  }

  const session = await auth.getServerSession()
  const user = session ? await server.user.getMe.query() : undefined

  const lastFuture = props.attendanceEvents.findLastIndex((event) => !isPast(event.end))
  const attendanceIds = props.attendanceEvents.map((event) => event.attendance?.id).filter(Boolean) as AttendanceId[]
  const futureEvents = props.attendanceEvents.slice(0, lastFuture + 1)
  const pastEvents = props.attendanceEvents.slice(lastFuture + 1)

  const attendanceStatuses = user
    ? await server.attendance.getAttendeeStatuses.query({
        userId: user.id,
        attendanceIds: attendanceIds,
      })
    : null

  const futureEventItems = futureEvents.map((eventDetail) => mapEventDetailToItem(attendanceStatuses, eventDetail))
  const pastEventItems = pastEvents.map((eventDetail) => mapEventDetailToItem(attendanceStatuses, eventDetail))

  return (
    <section className="w-full flex flex-col gap-2">
      {futureEventItems}

      {futureEventItems.length > 0 && pastEventItems.length > 0 && (
        <div className="w-full flex flex-row items-center gap-2 sm:-my-1">
          <span className="grow h-[2px] bg-gray-200 dark:bg-stone-800 rounded-full" />
          <Text className="text-gray-400 dark:text-stone-700 text-xs uppercase tracking-widest font-medium select-none">
            Tidligere arrangementer
          </Text>
          <span className="grow h-[2px] bg-gray-200 dark:bg-stone-800 rounded-full" />
        </div>
      )}

      {pastEventItems.length > 0 && pastEventItems}
    </section>
  )
}
