import { Tilt } from "@dotkomonline/ui"
import type { FC } from "react"
import Image from "next/image"
import { PlaceHolderImage } from "src/components/atoms/PlaceHolderImage"

interface ArticleImageProps {
  imageUrl: string
  alt: string
  className?: string
  orientation: "horizontal" | "vertical"
}

export const ArticleImage: FC<ArticleImageProps> = ({ imageUrl, alt, orientation }) => {
  return (
    <Tilt glareBorderRadius="var(--radius-lg)">
      <div className="w-full">
        {orientation === "vertical" ? (
          <div className="bg-gray-100 dark:bg-stone-800/50 rounded-lg overflow-hidden aspect-video w-full">
            {imageUrl !== "" ? (
              <Image
                src={imageUrl}
                alt={alt}
                width={0}
                height={0}
                loading="lazy"
                decoding="async"
                className="inset-0 w-full h-full object-cover"
              />
            ) : (
              <PlaceHolderImage variant="OTHER" className="object-cover rounded-md" />
            )}
          </div>
        ) : (
          <div className="aspect-16/9 bg-gray-100 dark:bg-stone-800 overflow-hidden h-46 rounded-lg">
            {imageUrl !== "" ? (
              <Image
                src={imageUrl}
                alt={alt}
                height={0}
                width={0}
                loading="lazy"
                decoding="async"
                className="inset-0 w-full h-full object-cover rounded-md"
              />
            ) : (
              <PlaceHolderImage variant="OTHER" className="object-cover rounded-md" />
            )}
          </div>
        )}
      </div>
    </Tilt>
  )
}
