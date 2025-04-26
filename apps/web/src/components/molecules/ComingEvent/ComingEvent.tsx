import EventImagePlaceholder from "@/assets/EventImagePlaceholder.svg"
import { slugify } from "@/utils/slugs"
import type { EventDetail } from "@dotkomonline/types"
import { Badge } from "@dotkomonline/ui"
import Image from "next/image"
import Link from "next/link"
import type React from "react"
interface ComingEventProps {
  eventDetail: EventDetail
}

export const EventCard: React.FC<ComingEventProps> = ({
  eventDetail: {
    event: { id, imageUrl, title, type, start },
    attendance,
  },
}) => {
  const numAttendees = attendance?.pools?.reduce((prev, pool) => prev + pool.numAttendees, 0)
  const capacity = attendance?.pools?.reduce((prev, pool) => prev + pool.capacity, 0)

  return (
    <Link href={`/events/${slugify(title)}/${id}`}>
      <div className="mt-2 flex flex-col">
        <div className="relative">
          <Image
            src={imageUrl ? imageUrl : EventImagePlaceholder}
            alt={title}
            width={320}
            height={180}
            style={{ width: 320, height: 180 }}
            className="rounded-xl border-2 border-slate-4 object-cover aspect-[16/9]"
          />
          <Badge color="green" variant="solid" className="absolute bottom-2 left-2">
            {type}
          </Badge>
        </div>
        <div className="">
          <div>
            <p className="m-0">{title}</p>
            <p className="m-0">{start.toDateString()}</p>
            <p className="m-0">
              {numAttendees}/{capacity}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
