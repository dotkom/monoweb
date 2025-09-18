import type { Attendance, Event } from "@dotkomonline/types"
import { Title, cn } from "@dotkomonline/ui"
import { createEventPageUrl } from "@dotkomonline/utils"
import { isPast } from "date-fns"
import Link from "next/link"
import type { FC } from "react"
import { AttendanceStatus } from "./AttendanceStatus"
import { DateAndTime } from "./DateAndTime"
import { Thumbnail } from "./Thumbnail"

export interface EventListItemProps {
  event: Event
  attendance: Attendance | null
  userId: string | null
}

export const EventListItem: FC<EventListItemProps> = ({ event, attendance, userId }: EventListItemProps) => {
  const { id, title, type, imageUrl: customImageUrl } = event
  const reservedStatus = attendance?.attendees.find((attendee) => attendee.user.id === userId)?.reserved ?? null

  const past = isPast(event.end)

  return (
    <Link
      href={createEventPageUrl(id, title)}
      className={cn(
        // [calc(100%+1rem)] is to offset the -mx-2
        "group flex flex-row gap-3 w-[calc(100%+1rem)] rounded-xl p-2 -mx-2 last:-mb-2",
        "hover:bg-gray-50 dark:hover:bg-stone-800 transition-colors",
        past && "text-gray-600 dark:text-stone-200 hover:text-gray-800 dark:hover:text-stone-300"
      )}
    >
      <Thumbnail imageUrl={customImageUrl} alt={title} startInPast={past} eventType={type} />

      <div className="flex flex-col gap-1">
        <div className="flex flex-row gap-1">
          <Title element="h3" size="sm" className="font-normal text-base md:text-lg">
            {title}
          </Title>
        </div>

        <div className="flex flex-col gap-2">
          <DateAndTime start={event.start} end={event.end} />

          {attendance && (
            <AttendanceStatus attendance={attendance} reservedStatus={reservedStatus} eventEndInPast={past} />
          )}
        </div>
      </div>
    </Link>
  )
}

export const EventListItemSkeleton: FC = () => {
  return (
    <div className="flex flex-row gap-2 w-full rounded-lg -mx-2 p-2">
      <div className="aspect-[4/3] h-[6rem] bg-gray-300 dark:bg-stone-600 rounded-lg animate-pulse" />

      <div className="flex flex-col gap-4">
        <div className="w-64 h-6 bg-gray-300 dark:bg-stone-600 rounded-sm animate-pulse" />

        <div className="flex gap-2">
          <div className="w-4 h-4 bg-gray-300 dark:bg-stone-600 rounded-sm animate-pulse" />
          <div className="w-28 h-4 bg-gray-300 dark:bg-stone-600 rounded-sm animate-pulse" />
        </div>

        <div className="flex gap-2">
          <div className="w-4 h-4 bg-gray-300 dark:bg-stone-600 rounded-sm animate-pulse" />
          <div className="w-6 h-4 bg-gray-300 dark:bg-stone-600 rounded-sm animate-pulse" />
        </div>
      </div>
    </div>
  )
}
