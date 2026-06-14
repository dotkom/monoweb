import { cn } from "@dotkomonline/ui"
import type { ImgHTMLAttributes } from "react"

type UnoptimizedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean
  priority?: boolean
}

const UnoptimizedImage = ({ fill, priority, style, className, ...props }: UnoptimizedImageProps) => {
  const fillStyle = fill ? "absolute inset-0 w-full h-full" : undefined

  // biome-ignore lint/performance/noImgElement: this is the point
  return <img alt={props.alt} className={cn(fillStyle, className)} style={style} {...props} />
}

export default UnoptimizedImage
