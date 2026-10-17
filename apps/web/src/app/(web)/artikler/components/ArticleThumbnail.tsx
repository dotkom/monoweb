import { Tilt, cn } from "@dotkomonline/ui"
import type { FC } from "react"
import { PlaceHolderImage } from "src/components/atoms/PlaceHolderImage"

interface EventListItemThumbnailProps {
  imageUrl?: string | null
  alt: string
  compact?: boolean
}

export const ArticleThumbnail: FC<EventListItemThumbnailProps> = ({ imageUrl, alt, compact = false }) => {
  return (
    <Tilt>
      <div className="relative w-max">
        <div
          className={cn(
            "relative aspect-16/9 bg-gray-100 dark:bg-stone-800 overflow-hidden",
            !compact && "h-22 sm:h-28 rounded-lg",
            compact && "h-16 sm:h-16 rounded-sm"
          )}
        >
          {imageUrl ? (
            // biome-ignore lint/performance/noImgElement: unoptimized next/image crashes iOS Safari (#3062)
            <img
              src={imageUrl}
              alt={alt}
              loading="lazy"
              decoding="async"
              className={cn(
                "absolute inset-0 w-full h-full object-cover",
                !compact && "rounded-md",
                compact && "rounded-sm"
              )}
            />
          ) : (
            <PlaceHolderImage
              variant="OTHER"
              className={cn("object-cover", !compact && "rounded-md", compact && "rounded-sm")}
            />
          )}
        </div>
      </div>
    </Tilt>
  )
}
