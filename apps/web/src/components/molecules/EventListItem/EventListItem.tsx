import { getAttendanceStatus } from "@/app/arrangementer/components/attendanceStatus"
import type { AttendanceEvent } from "@dotkomonline/types"
import { Title, cn } from "@dotkomonline/ui"
import { slugify } from "@dotkomonline/utils"
import { isPast } from "date-fns"
import Link from "next/link"
import type { FC } from "react"
import { AttendanceStatus } from "./AttendanceStatus"
import { DateAndTime } from "./DateAndTime"
import { Thumbnail } from "./Thumbnail"

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/320x240/png?text=Arrangement"

export interface EventListItemProps {
  attendanceEvent: AttendanceEvent
  attendeeStatus: "RESERVED" | "UNRESERVED" | null
}

export const EventListItem: FC<EventListItemProps> = ({ attendanceEvent, attendeeStatus }: EventListItemProps) => {
  const { id, title, type, imageUrl: customImageUrl } = attendanceEvent

  const imageUrl = customImageUrl || PLACEHOLDER_IMAGE_URL
  const url = `/arrangementer/${slugify(title)}/${id}`

  const attendanceStatus = attendanceEvent.attendance && getAttendanceStatus(attendanceEvent.attendance)

  const startInPast = isPast(attendanceEvent.start)
  const isReserved = attendeeStatus === "RESERVED"
  const isUnreserved = attendeeStatus === "UNRESERVED"
  const inPast = attendanceStatus === "Closed" || startInPast

  return (
    <section>
      <Link
        href={url}
        className={cn(
          "flex flex-row gap-3 w-full rounded-lg p-2",
          "hover:bg-slate-2 transition-colors",
          isReserved && !inPast && "bg-green-1 hover:bg-green-2",
          isUnreserved && !inPast && "bg-yellow-1 hover:bg-yellow-2",
          startInPast && "text-slate-11 hover:text-slate-12",
          "group"
        )}
      >
        <Thumbnail imageUrl={imageUrl} alt={title} startInPast={startInPast} eventType={type} />

        <div className="flex flex-col gap-2">
          <Title element="h3" size="sm" className="font-normal">
            {title}
          </Title>

          <DateAndTime start={attendanceEvent.start} end={attendanceEvent.end} />

          <AttendanceStatus
            attendance={attendanceEvent.attendance}
            attendanceStatus={attendanceStatus}
            startInPast={startInPast}
            isReserved={isReserved}
            isUnreserved={isUnreserved}
          />
        </div>
      </Link>
    </section>
  )
}

export const EventListItemSkeleton: FC = () => {
  return (
    <div className="flex flex-row gap-2 w-full rounded-lg p-2">
      <div className="aspect-[4/3] h-[6rem] bg-slate-4 rounded-lg animate-pulse" />

      <div className="flex flex-col gap-4">
        <div className="w-32 h-6 bg-slate-4 rounded animate-pulse" style={{ width: `${Math.random() * 10 + 5}rem` }} />

        <div className="flex gap-2">
          <div className="w-4 h-4 bg-slate-4 rounded animate-pulse" />
          <div className="w-24 h-4 bg-slate-4 rounded animate-pulse" style={{ width: `${Math.random() * 2 + 4}rem` }} />
        </div>

        <div className="flex gap-2">
          <div className="w-4 h-4 bg-slate-4 rounded animate-pulse" />
          <div className="w-16 h-4 bg-slate-4 rounded animate-pulse" style={{ width: `${Math.random() * 1 + 2}rem` }} />
        </div>
      </div>
    </div>
  )
}
