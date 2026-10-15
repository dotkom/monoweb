import { Tilt, cn } from "@dotkomonline/ui"
import type { FC } from "react"
import { PlaceHolderImage } from "src/components/atoms/PlaceHolderImage"

interface ArticleImageProps {
  imageUrl?: string | null
  alt: string
  className?: string
  imageClassName?: string
}

export const ArticleImage: FC<ArticleImageProps> = ({ imageUrl, alt, className, imageClassName }) => {
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
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <PlaceHolderImage variant="OTHER" className="object-cover" />
          )}
        </div>
      </div>
    </Tilt>
  )
}
