import type { EventType } from "@dotkomonline/types"
import { Badge, Tilt, cn } from "@dotkomonline/ui"
import Image from "next/image.js"
import type { FC } from "react"
import { PlaceHolderImage } from "../../atoms/PlaceHolderImage"

const EVENTS = {
  ACADEMIC: {
    label: "Kurs",
    backgroundColor: "blue",
  },
  GENERAL_ASSEMBLY: {
    label: "Generalforsamling",
    backgroundColor: "amber",
  },
  INTERNAL: {
    label: "Intern",
    backgroundColor: "amber",
  },
  OTHER: {
    label: "Annet",
    backgroundColor: "amber",
  },
  COMPANY: {
    label: "Bedpres",
    backgroundColor: "red",
  },
  SOCIAL: {
    label: "Sosialt",
    backgroundColor: "green",
  },
  WELCOME: {
    label: "Fadderuke",
    backgroundColor: "amber",
  },
} as const satisfies Record<EventType, { label: string; backgroundColor: string }>

interface EventListItemThumbnailProps {
  imageUrl?: string | null
  alt: string
  startInPast: boolean
  eventType: EventType
}

export const Thumbnail: FC<EventListItemThumbnailProps> = ({ imageUrl, alt, startInPast, eventType }) => {
  const { label, backgroundColor } = EVENTS[eventType]

  return (
    <Tilt>
      <div className="relative w-max">
        <div className="aspect-[4/3] h-[6rem] bg-gray-100 dark:bg-stone-800 rounded-lg overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              fill
              alt={alt}
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

        <Badge
          variant="light"
          color={backgroundColor}
          className={cn(
            "absolute bottom-[3px] right-[3px] px-1 py-0.5 rounded-sm text-xs",
            startInPast && "grayscale group-hover:grayscale-[50%] transition-all"
          )}
        >
          {label}
        </Badge>
      </div>
    </Tilt>
  )
}
