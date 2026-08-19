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
}

export const Thumbnail: FC<EventListItemThumbnailProps> = ({ imageUrl, alt, startInPast, eventType }) => {
  const { label, backgroundColor } = EVENT_TYPE_CONFIG[eventType]

  return (
    <Tilt>
      <div className="relative w-max">
        <div className="relative aspect-[16/9] h-22 sm:h-28 bg-gray-100 dark:bg-stone-800 rounded-lg overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={alt}
              fill
              sizes="(min-width: 640px) 200px, 160px"
              className={cn(
                "rounded-md object-cover",
                startInPast && "opacity-50 grayscale group-hover:grayscale-0 transition-all"
              )}
            />
          ) : (
            <PlaceHolderImage
              variant={eventType}
              className={cn(
                "rounded-md object-cover",
                startInPast && "opacity-50 grayscale group-hover:grayscale-0 transition-all"
              )}
            />
          )}
        </div>

        <div className="absolute bottom-1 right-1 rounded-sm bg-background">
          <Badge
            color={backgroundColor}
            className={cn(
              "px-1 py-0.5 text-xs rounded-sm flex",
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
