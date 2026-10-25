import { Tilt } from "@dotkomonline/ui"
import Image from "next/image"
import type { FC } from "react"
import { PlaceHolderImage } from "src/components/atoms/PlaceHolderImage"

interface ArticleImageProps {
  imageUrl: string
  alt: string
  className?: string
  orientation: "horizontal" | "vertical"
}

export const ArticleImage: FC<ArticleImageProps> = ({ imageUrl, alt, orientation }) => {
  const image =
    imageUrl !== "" ? (
      <Image
        src={imageUrl}
        alt={alt}
        width={0}
        height={0}
        loading="lazy"
        decoding="async"
        className="inset-0 size-full object-cover rounded-md"
      />
    ) : (
      <PlaceHolderImage variant="OTHER" className="object-cover rounded-md" />
    )

  return (
    <Tilt glareBorderRadius="var(--radius-lg)">
      {orientation === "vertical" ? (
        <div className="w-full overflow-hidden rounded-lg aspect-video bg-gray-100 dark:bg-stone-800/50">{image}</div>
      ) : (
        <div className="relative w-max shrink-0 overflow-hidden rounded-lg aspect-video h-28 sm:h-36 bg-gray-100 dark:bg-stone-800">
          {image}
        </div>
      )}
    </Tilt>
  )
}
