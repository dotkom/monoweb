import { CalendarBox } from "@/components/atoms/CalendarBox"
import type { EventType } from "@dotkomonline/rpc/event"
import { Badge, Tilt, cn } from "@dotkomonline/ui"
import { isPast } from "date-fns"
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
  showBadge = true,
  showCalendarBox = false,
}) => {
  const { label, backgroundColor } = EVENT_TYPE_CONFIG[eventType]

  const eventHasEnded = isPast(end)

  return (
    <Tilt glareBorderRadius="var(--radius-lg)">
      <div className={cn("relative", className)}>
        <div className={cn("relative bg-gray-100 dark:bg-stone-800/50 rounded-lg overflow-hidden", imageClassName)}>
          {imageUrl ? (
            // biome-ignore lint/performance/noImgElement: unoptimized next/image crashes iOS Safari (#3062)
            <img
              src={imageUrl}
              alt={alt}
              loading="lazy"
              decoding="async"
              className={cn(
                "absolute inset-0 w-full h-full object-cover",
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
              includeWeekday
            />
          </div>
        )}
      </div>
    </Tilt>
  )
}
