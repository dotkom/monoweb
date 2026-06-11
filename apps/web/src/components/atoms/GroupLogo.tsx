import { Avatar, AvatarImage, cn } from "@dotkomonline/ui"
import Image from "next/image"
import type { ComponentProps, ReactNode } from "react"

type GroupLogoAvatarProps = {
  src?: string | null
  alt: string
  className?: string
  imageClassName?: string
  size?: ComponentProps<typeof Avatar>["size"]
  fallback?: ReactNode
}

export function GroupLogoAvatar({ src, alt, className, imageClassName, size, fallback }: GroupLogoAvatarProps) {
  return (
    <Avatar size={size} className={cn("bg-white", className)}>
      <AvatarImage src={src ?? undefined} alt={alt} className={cn("object-contain", imageClassName)} />
      {fallback}
    </Avatar>
  )
}

type GroupLogoProps = {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  containerClassName?: string
}

export function GroupLogo({ src, alt, width, height, className, containerClassName }: GroupLogoProps) {
  return (
    <div className={cn("flex shrink-0 items-center justify-center overflow-hidden bg-white", containerClassName)}>
      <Image src={src} alt={alt} width={width} height={height} className={cn("object-contain", className)} />
    </div>
  )
}
