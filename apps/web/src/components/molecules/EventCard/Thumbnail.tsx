import type { EventType } from "@dotkomonline/types"
import { Text, cn } from "@dotkomonline/ui"
import type { FC } from "react"

const EVENTS = {
  ACADEMIC: {
    label: "Akademisk",
    backgroundColor: "bg-blue-300",
    textColor: "text-blue-950",
  },
  BEDPRES: {
    label: "Bedpres",
    backgroundColor: "bg-green-300",
    textColor: "text-green-950",
  },
  COMPANY: {
    label: "Bedrift",
    backgroundColor: "bg-yellow-300",
    textColor: "text-yellow-950",
  },
  SOCIAL: {
    label: "Sosialt",
    backgroundColor: "bg-red-300",
    textColor: "text-red-950",
  },
} as const satisfies Record<EventType, { label: string; backgroundColor: string; textColor: string }>

interface EventTypePillProps {
  eventType: EventType
  startInPast: boolean
}

const EventTypePill: FC<EventTypePillProps> = ({ eventType, startInPast }) => {
  const { label, backgroundColor, textColor } = EVENTS[eventType]

  return (
    <div
      className={cn(
        "absolute bottom-[3px] right-[3px] w-fit",
        startInPast && "grayscale group-hover:grayscale-[50%] transition-all"
      )}
    >
      <Text className={cn("px-1 py-0.5 rounded-xs text-xs", backgroundColor, textColor)}>{label}</Text>
    </div>
  )
}

interface EventListItemThumbnailProps {
  imageUrl: string
  alt: string
  startInPast: boolean
  eventType: EventType
}

export const Thumbnail: FC<EventListItemThumbnailProps> = ({ imageUrl, alt, startInPast, eventType }) => {
  return (
    <div className="relative w-max">
      <img
        src={imageUrl}
        alt={alt}
        className={cn(
          "aspect-[4/3] h-[6rem] object-cover rounded-md",
          startInPast && "opacity-50 grayscale group-hover:grayscale-0 transition-all"
        )}
      />

      <EventTypePill eventType={eventType} startInPast={startInPast} />
    </div>
  )
}
