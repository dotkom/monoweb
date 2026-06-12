import { AttendanceStatus } from "@/components/molecules/EventListItem/AttendanceStatus"
import type { EventWithAttendance } from "@dotkomonline/types"
import { Text, Timeline, TimelineContent, TimelineDot, TimelineItem, cn } from "@dotkomonline/ui"
import { createEventPageUrl } from "@dotkomonline/utils"
import { IconMapPin } from "@tabler/icons-react"
import { compareAsc, format, isPast } from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link"

type EventTimelineProps = {
  eventsWithAttendance: EventWithAttendance[]
}

export function EventTimeline({ eventsWithAttendance }: EventTimelineProps) {
  if (eventsWithAttendance.length === 0) {
    return <Text className="text-muted-foreground">Programmet er ikke klart ennå. Følg med!</Text>
  }

  const sorted = eventsWithAttendance.toSorted((a, b) => compareAsc(a.event.start, b.event.start))

  return (
    <Timeline>
      {sorted.map(({ event, attendance }) => {
        const eventEndInPast = isPast(event.end)

        return (
          <TimelineItem key={event.id}>
            <TimelineDot />
            <TimelineContent>
              <Text className="pb-1 font-medium text-muted-foreground text-xs">
                {format(event.start, "d. MMM 'kl.' HH:mm", { locale: nb })}
              </Text>

              <Link
                href={createEventPageUrl(event.id, event.title)}
                className="group -m-1.5 flex w-[calc(100%+0.75rem)] flex-col gap-1 rounded-lg p-1.5 transition-colors hover:bg-white/40"
              >
                <Text className={cn("font-medium group-hover:underline", eventEndInPast && "text-muted-foreground")}>
                  {event.title}
                </Text>

                {event.shortDescription && (
                  <Text className="line-clamp-2 text-sm text-muted-foreground">{event.shortDescription}</Text>
                )}

                {event.locationTitle && (
                  <Text className="flex items-center gap-1 text-sm text-muted-foreground">
                    <IconMapPin aria-hidden className="size-4 shrink-0" />
                    {event.locationTitle}
                  </Text>
                )}

                {attendance && (
                  <AttendanceStatus attendance={attendance} attendee={null} eventEndInPast={eventEndInPast} />
                )}
              </Link>
            </TimelineContent>
          </TimelineItem>
        )
      })}
    </Timeline>
  )
}
