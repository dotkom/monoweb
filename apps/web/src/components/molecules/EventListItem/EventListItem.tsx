import type { AttendanceEvent } from "@dotkomonline/types"
import { Title, cn } from "@dotkomonline/ui"
import { slugify } from "@dotkomonline/utils"
import { isPast } from "date-fns"
import Link from "next/link"
import type { FC } from "react"
import { AttendanceStatus } from "./AttendanceStatus"
import { DateAndTime } from "./DateAndTime"
import { Thumbnail } from "./Thumbnail"

export interface EventListItemProps {
  attendanceEvent: AttendanceEvent
  attendeeStatus: "RESERVED" | "UNRESERVED" | null
}

export const EventListItem: FC<EventListItemProps> = ({ attendanceEvent, attendeeStatus }: EventListItemProps) => {
  const { id, title, type, imageUrl: customImageUrl } = attendanceEvent

  const url = `/arrangementer/${slugify(title)}/${id}`

  const past = isPast(attendanceEvent.end)

  return (
    <section>
      <Link
        href={url}
        className={cn(
          "group flex flex-row gap-3 w-full rounded-xl p-2",
          "hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors",
          past && "text-gray-600 dark:text-stone-600 hover:text-gray-800 dark:hover:text-stone-400"
        )}
      >
        <Thumbnail imageUrl={customImageUrl} alt={title} startInPast={past} eventType={type} />

        <div className="flex flex-col gap-1">
          <Title element="h3" size="sm" className="font-normal">
            {title}
          </Title>

          <div className="flex flex-col gap-2">
            <DateAndTime start={attendanceEvent.start} end={attendanceEvent.end} />

            <AttendanceStatus
              attendance={attendanceEvent.attendance}
              attendeeStatus={attendeeStatus}
              eventEndInPast={past}
            />
          </div>
        </div>
      </Link>
    </section>
  )
}

export const EventListItemSkeleton: FC = () => {
  return (
    <div className="flex flex-row gap-2 w-full rounded-lg p-2">
      <div className="aspect-[4/3] h-[6rem] bg-gray-300 rounded-lg animate-pulse" />

      <div className="flex flex-col gap-4">
        <div
          className="w-32 h-6 bg-gray-300 rounded-sm animate-pulse"
          style={{ width: `${Math.random() * 10 + 5}rem` }}
        />

        <div className="flex gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded-sm animate-pulse" />
          <div
            className="w-24 h-4 bg-gray-300 rounded-sm animate-pulse"
            style={{ width: `${Math.random() * 2 + 4}rem` }}
          />
        </div>

        <div className="flex gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded-sm animate-pulse" />
          <div
            className="w-16 h-4 bg-gray-300 rounded-sm animate-pulse"
            style={{ width: `${Math.random() * 1 + 2}rem` }}
          />
        </div>
      </div>
    </div>
  )
}
