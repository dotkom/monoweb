import { CalendarBox } from "@/components/atoms/CalendarBox"
import type { EventType } from "@dotkomonline/rpc/event"
import { Badge, Tilt, cn } from "@dotkomonline/ui"
import { isPast } from "date-fns"
import Image from "next/image"
import type { FC } from "react"
import { PlaceHolderImage } from "../../atoms/PlaceHolderImage"
import { EVENT_TYPE_CONFIG } from "./eventTypeConfig"

interface EventImageProps {
  imageUrl?: string | null
  alt: string
  start: Date
  end: Date
  eventType: EventType
  className?: string
  imageClassName?: string
  sizes?: string
  showBadge?: boolean
  showCalendarBox?: boolean
}

export const EventImage: FC<EventImageProps> = ({
  imageUrl,
  alt,
  start,
  end,
  eventType,
  className,
  imageClassName,
  sizes = "(min-width: 640px) 200px, 160px",
  showBadge = true,
  showCalendarBox = false,
}) => {
  const { label, backgroundColor } = EVENT_TYPE_CONFIG[eventType]

  const eventHasEnded = isPast(end)

  return (
    <Tilt>
      <div className={cn("relative", className)}>
        <div className={cn("relative bg-gray-100 dark:bg-stone-800/50 rounded-lg overflow-hidden", imageClassName)}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={alt}
              fill
              sizes={sizes}
              className={cn(
                "object-cover",
                eventHasEnded && "opacity-50 grayscale group-hover:grayscale-0 transition-all"
              )}
            />
          ) : (
            <PlaceHolderImage
              variant={eventType}
              className={cn(
                "object-cover",
                eventHasEnded && "opacity-50 grayscale group-hover:grayscale-0 transition-all"
              )}
            />
          )}
        </div>

        {showBadge && (
          <div
            className={cn(
              "absolute bottom-1 right-1 rounded-sm bg-background",
              showCalendarBox && "bottom-1.5 right-1.5"
            )}
          >
            <Badge
              color={backgroundColor}
              className={cn(
                "px-1 py-0.5 text-xs rounded-sm flex",
                eventHasEnded && "grayscale group-hover:grayscale-50 transition-all"
              )}
            >
              {label}
            </Badge>
          </div>
        )}

        {showCalendarBox && (
          <div className="absolute bottom-1.5 left-1.5">
            <CalendarBox
              start={start}
              end={end}
              className="bg-background border-gray-300 dark:border-stone-700 rounded-sm"
              titleClassName="rounded-t-sm"
              dayTextClassName="text-sm"
            />
          </div>
        )}
      </div>
    </Tilt>
  )
}
