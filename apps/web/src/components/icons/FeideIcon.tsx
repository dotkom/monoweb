import { cn } from "@dotkomonline/ui"
import Image, { type ImageProps } from "next/image"

const getSrc = (variant: "default" | "dark" | "light") => {
  switch (variant) {
    case "default":
      return "/feide-symbol.svg"
    case "dark":
      return "/feide-symbol-dark.svg"
    case "light":
      return "/feide-symbol-light.svg"
  }
}

export type FeideIconProps = Omit<ImageProps, "src" | "alt" | "width" | "height"> & {
  variant?: "default" | "dark" | "light"
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
