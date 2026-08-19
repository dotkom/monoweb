import { getAttendee, type Attendance, type AttendanceSummary } from "@dotkomonline/rpc/attendance"
import type { Event, EventSummary } from "@dotkomonline/rpc/event"
import type { UserId } from "@dotkomonline/rpc/user"
import { Text, Title, cn } from "@dotkomonline/ui"
import { createEventPageUrl } from "@dotkomonline/utils"
import { IconMapPin } from "@tabler/icons-react"
import { isPast } from "date-fns"
import Link from "next/link"
import type { FC } from "react"
import { AttendanceStatus } from "./AttendanceStatus"
import { EventImage } from "./EventImage"
import { EventPrice } from "./EventPrice"

export interface EventCardProps {
  event: Event | EventSummary
  attendance: Attendance | AttendanceSummary | null
  userId?: UserId | null
  className?: string
}

export const EventCard: FC<EventCardProps> = ({ event, attendance, userId, className }) => {
  const { id, title, type, imageUrl, locationTitle } = event
  const attendee = getAttendee(attendance, userId ?? null)
  const eventHasEnded = isPast(event.end)

  return (
    <Link
      href={createEventPageUrl(id, title)}
      className={cn(
        "group flex flex-col w-full min-w-0 h-fit gap-3 p-3 rounded-2xl transition-colors",
        "border border-transparent hover:border-gray-200 dark:hover:border-stone-700 dark:hover:bg-stone-800/20",
        eventHasEnded && "text-gray-600 dark:text-stone-200",
        className
      )}
    >
      <EventImage
        imageUrl={imageUrl}
        alt={title}
        start={event.start}
        end={event.end}
        eventType={type}
        className="w-full min-w-0"
        imageClassName="aspect-video w-full"
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        showCalendarBox
      />

      <div className="flex flex-col gap-2 w-full min-w-0">
        <Title
          element="h3"
          size="lg"
          title={title}
          className={cn(
            "max-md:text-lg text-xl font-semibold line-clamp-2 wrap-break-word transition-colors",
            eventHasEnded &&
              "text-gray-600 dark:text-stone-400 group-hover:text-gray-800 dark:group-hover:text-stone-300"
          )}
        >
          {title}
        </Title>

        <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-2 w-full min-w-0">
          {locationTitle && (
            <div className="flex flex-row items-center gap-2 min-w-0">
              <IconMapPin className="size-4 shrink-0 dark:text-stone-400" />
              <Text
                className={cn(
                  "text-sm wrap-break-word line-clamp-2 transition-colors dark:text-stone-400",
                  eventHasEnded && "text-gray-600 group-hover:text-gray-800 dark:group-hover:text-stone-300"
                )}
              >
                {locationTitle}
              </Text>
            </div>
          )}

          {attendance && (
            <>
              <AttendanceStatus
                attendance={attendance}
                attendee={attendee}
                eventEndInPast={eventHasEnded}
                showNotOpenedLabel={false}
              />

              <EventPrice price={attendance.attendancePrice} />
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

export const EventCardSkeleton: FC = () => {
  return (
    <div className="flex flex-col gap-3 p-3 rounded-2xl min-w-0 animate-pulse">
      <div className="aspect-video w-full bg-gray-300 dark:bg-stone-600 rounded-lg" />
      <div className="h-6 max-w-[85%] bg-gray-300 dark:bg-stone-600 rounded-sm" />
      <div className="h-4 max-w-[60%] bg-gray-300 dark:bg-stone-600 rounded-sm" />
    </div>
  )
}
