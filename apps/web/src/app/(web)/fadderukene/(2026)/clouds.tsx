import { cn } from "@dotkomonline/ui"
import type { CSSProperties } from "react"

type ScrollingCloudsProps = {
  className?: string
  imageClassName?: string
  duration?: `${number}s`
  delay?: `${number}s`
}

export function ScrollingClouds({ className, imageClassName, duration = "180s", delay = "0s" }: ScrollingCloudsProps) {
  const style = {
    "--left-to-right-duration": duration,
    animationDelay: delay,
  } as CSSProperties

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden", className)}>
      <div className="flex w-max animate-left-to-right dark:hidden" style={style}>
        <CloudImage src="/fadderuke-2026-background-clouds.svg" className={imageClassName} />
        <CloudImage src="/fadderuke-2026-background-clouds.svg" className={imageClassName} />
      </div>
      <div className="flex w-max animate-left-to-right not-dark:hidden" style={style}>
        <CloudImage src="/fadderuke-2026-background-clouds-dark.svg" className={imageClassName} />
        <CloudImage src="/fadderuke-2026-background-clouds-dark.svg" className={imageClassName} />
      </div>
    </div>
  )
}

function CloudImage({ src, className }: { src: string; className?: string }) {
  return (
    // biome-ignore lint/performance/noImgElement: wide repeating SVG background strip
    <img
      src={src}
      alt=""
      width={6757}
      height={591}
      draggable={false}
      className={cn("h-auto w-[max(100vw,80rem)] max-w-none shrink-0 pointer-events-none select-none", className)}
    />
  )
}
