import { getAttendee, type Attendance, type AttendanceSummary } from "@dotkomonline/rpc/attendance"
import type { Event, EventSummary } from "@dotkomonline/rpc/event"
import { Title, cn } from "@dotkomonline/ui"
import { createEventPageUrl } from "@dotkomonline/utils"
import { isPast } from "date-fns"
import Link from "next/link"
import type { FC } from "react"
import { AttendanceStatus } from "./AttendanceStatus"
import { DateAndTime } from "./DateAndTime"
import { Thumbnail } from "./Thumbnail"

export interface EventListItemProps {
  event: Event | EventSummary
  attendance: Attendance | AttendanceSummary | null
  userId?: string | null
  className?: string
  compact?: boolean
}

export const EventListItem: FC<EventListItemProps> = (props: EventListItemProps) => {
  const { event, attendance, className, compact = false } = props
  const { id, title, type, imageUrl: customImageUrl } = event
  const userId = "userId" in props ? props.userId : undefined
  const attendee = getAttendee(attendance, userId ?? null)

  const past = isPast(event.end)

  return (
    <Link
      href={createEventPageUrl(id, title)}
      className={cn(
        // [calc(100%+1rem)] is to offset the -mx-2
        "group flex flex-row gap-3 sm:gap-4 w-[calc(100%+1rem)] rounded-xl p-2 -mx-2 last:-mb-2",
        "hover:bg-gray-50 dark:hover:bg-stone-800 transition-colors",
        past && "text-gray-600 dark:text-stone-200 hover:text-gray-800 dark:hover:text-stone-300",
        compact && "sm:gap-3",
        className
      )}
    >
      <Thumbnail imageUrl={customImageUrl} alt={title} startInPast={past} eventType={type} compact={compact} />

      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-row gap-1">
          <Title
            element="h3"
            size="sm"
            className={cn(
              "font-normal",
              !compact && "text-base md:text-lg line-clamp-1 sm:line-clamp-2 break-all",
              compact && "text-xs sm:text-sm font-medium"
            )}
          >
            {title}
          </Title>
        </div>

        <div className={cn("flex flex-col gap-2", compact && "gap-0.5")}>
          <DateAndTime start={event.start} end={event.end} compact={compact} />

          {attendance && (
            <AttendanceStatus
              attendance={attendance}
              attendee={attendee}
              eventEndInPast={past}
              size={compact ? "sm" : undefined}
            />
          )}
        </div>
      </div>
    </Link>
  )
}

export const EventListItemSkeleton: FC = () => {
  return (
    <div className="flex flex-row gap-4 w-full rounded-lg py-2">
      <div className="aspect-[16/9] h-22 sm:h-28 bg-gray-300 dark:bg-stone-600 rounded-lg animate-pulse" />

      <div className="flex flex-col gap-4 w-full">
        <div className="max-w-64 h-6 bg-gray-300 dark:bg-stone-600 rounded-sm animate-pulse" />

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
