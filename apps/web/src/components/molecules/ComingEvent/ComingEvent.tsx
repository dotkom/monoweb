import { Badge } from "@dotkomonline/ui"
import Image from "next/image"
import Link from "next/link"
import type React from "react"
import EventImagePlaceholder from "@/assets/EventImagePlaceholder.svg"
import type { Event } from "@dotkomonline/types"

interface ComingEventProps {
  event: Event
}

// TODO: mye relative og absolute her.... too bad!
export const ComingEvent: React.FC<ComingEventProps> = ({ event }) => (
  <Link href={`events/${event.id}`}>
    <div className="mt-2 flex flex-col">
      <div className="relative flex flex-col items-center">
        <Image
          src={event.imageUrl || EventImagePlaceholder}
          alt={event.title}
          width={320}
          height={180}
          style={{ width: 320, height: 180 }}
          // downscale image 50% to fit in the space
          className="rounded-xl border-2 border-slate-4 object-cover w-full h-full"
        />
        <Badge color="green" variant="solid" className="absolute bottom-[-1px] left-[-8px]">
          {event.type}
        </Badge>
      </div>
      <div className="">
        <span>
          <span>{/* PLACEHOLDER */}</span>
          <div>
            <p className="m-0">{event.title}</p>
            <p className="m-0">{event.start.toString()}</p>
            <p className="m-0">
              {10}/{20}
            </p>
          </div>
        </span>
      </div>
    </div>
  </Link>
)
