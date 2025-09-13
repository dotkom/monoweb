import type { CSSProperties, PropsWithChildren } from "react"
import { cn } from "../../utils"

type StripedProps = PropsWithChildren<{
  colorA: string
  colorB: string
  animated?: boolean
  stripeWidth?: number
  speed?: `${number}s` | `${number}.${number}s`
  className?: string
}>

export const Stripes = ({
  colorA,
  colorB,
  animated,
  stripeWidth = 12,
  speed = "1.2s",
  className,
  children,
}: StripedProps) => {
  return (
    <div className={cn("group relative overflow-hidden w-full h-full", className)}>
      {/* Base color */}
      <div aria-hidden="true" className={cn("absolute inset-0", colorA)} />

      {/* Striped overlay */}
      <div
        aria-hidden="true"
        className={cn(
          // This width and transform black magic is to stop weird artifacts at the edges (specifically the left edge)
          // The parent has overflow-hidden so a 150% width is fine
          // -translate-x-1/3 makes it right-aligned, hiding the left edge artifacts outside (right-0 didn't work)
          "absolute inset-0 stripes-mask w-[150%] transform -translate-x-1/3",
          colorB,
          animated && "animate-stripes"
        )}
        style={
          {
            "--width": `${stripeWidth}px`,
            "--speed": speed,
          } as CSSProperties
        }
      />
      <div className="relative z-1 w-full">{children}</div>
    </div>
  )
}
