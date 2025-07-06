import EventImagePlaceholder from "@/assets/EventImagePlaceholder.svg"
import type { EventDetail } from "@dotkomonline/types"
import { Tilt, Title } from "@dotkomonline/ui"
import { slugify } from "@dotkomonline/utils"
import { isPast } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import type React from "react"
import { AttendanceStatus } from "../EventListItem/AttendanceStatus"
import { DateAndTime } from "../EventListItem/DateAndTime"

interface ComingEventProps {
  eventDetail: EventDetail
  attendeeStatus: "RESERVED" | "UNRESERVED" | null
}

export const EventCard: React.FC<ComingEventProps> = ({
  eventDetail: {
    event: { id, imageUrl, title, type, start, end },
    attendance,
  },
  attendeeStatus,
}) => {
  const startInPast = isPast(start)

  return (
    <Link href={`/arrangementer/${slugify(title)}/${id}`} className="flex flex-col">
      <div className="relative">
        <Image
          width={200}
          height={150}
          src={imageUrl ? imageUrl : EventImagePlaceholder}
          alt={title}
          className="rounded-lg border border-slate-3 object-cover aspect-[4/3]"
        />
      </div>
      <div>
        <Title element="p" size="sm" className="font-normal">
          {title}
        </Title>
        <DateAndTime start={start} end={end} />
        {attendance && (
          <AttendanceStatus attendance={attendance} attendeeStatus={attendeeStatus} startInPast={startInPast} />
        )}
      </div>
    </Link>
  )
}
