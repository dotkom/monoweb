import { cn } from "@dotkomonline/ui"
import Image, { type ImageProps } from "next/image"

type FeideIconVariant = "default" | "black" | "white"

const getSrc = (variant: FeideIconVariant) => {
  switch (variant) {
    case "default":
      return "/feide-symbol.svg"
    case "black":
      return "/feide-symbol-black.svg"
    case "white":
      return "/feide-symbol-white.svg"
  }
}

export type FeideIconProps = Omit<ImageProps, "src" | "alt" | "width" | "height"> & {
  variant?: FeideIconVariant
  size: number
}

export const FeideIcon = ({ className, size, variant = "default", ...props }: FeideIconProps) => {
  const src = getSrc(variant)

  return (
    <Image
      src={src}
      alt="FEIDE logo"
      width={size}
      height={size}
      className={cn("aspect-square", className)}
      {...props}
    />
  )
}
