import type { EventType } from "@dotkomonline/rpc/event"
import { Badge, Tilt, cn } from "@dotkomonline/ui"
import Image from "next/image"
import type { FC } from "react"
import { PlaceHolderImage } from "../../atoms/PlaceHolderImage"
import { EVENT_TYPE_CONFIG } from "./eventTypeConfig"

interface EventListItemThumbnailProps {
  imageUrl?: string | null
  alt: string
  startInPast: boolean
  eventType: EventType
  compact?: boolean
}

export const Thumbnail: FC<EventListItemThumbnailProps> = ({
  imageUrl,
  alt,
  startInPast,
  eventType,
  compact = false,
}) => {
  const { label, backgroundColor } = EVENT_TYPE_CONFIG[eventType]

  return (
    <Tilt>
      <div className="relative w-max">
        <div
          className={cn(
            "relative aspect-[16/9] bg-gray-100 dark:bg-stone-800 overflow-hidden",
            !compact && "h-22 sm:h-28 rounded-lg",
            compact && "h-16 sm:h-16 rounded-sm"
          )}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={alt}
              fill
              sizes="(min-width: 640px) 200px, 160px"
              className={cn(
                "object-cover",
                !compact && "rounded-md",
                compact && "rounded-sm",
                startInPast && "opacity-50 grayscale group-hover:grayscale-0 transition-all"
              )}
            />
          ) : (
            <PlaceHolderImage
              variant={eventType}
              className={cn(
                "object-cover",
                !compact && "rounded-md",
                compact && "rounded-sm",
                startInPast && "opacity-50 grayscale group-hover:grayscale-0 transition-all"
              )}
            />
          )}
        </div>

        <div
          className={cn(
            "absolute bottom-1 right-1 bg-background rounded-sm",
            compact && "bottom-0.5 right-0.5 rounded-xs"
          )}
        >
          <Badge
            color={backgroundColor}
            className={cn(
              "rounded-sm flex",
              !compact && "px-1 py-0.5 text-xs",
              compact && "px-0.5 h-3.5 text-[0.625rem] rounded-xs",
              startInPast && "grayscale group-hover:grayscale-50 transition-all"
            )}
          >
            {label}
          </Badge>
        </div>
      </div>
    </Tilt>
  )
}
