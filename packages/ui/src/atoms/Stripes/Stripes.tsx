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
    <div className={cn("group relative overflow-hidden", className)}>
      {/* Base color */}
      <div aria-hidden="true" className={cn("absolute inset-0", colorA)} />

      {/* Striped overlay */}
      <div
        aria-hidden="true"
        className={cn(
          // the width is 130% and translated -15% to hide weird edge artifacts when animating
          // overflow is hidden on the parent so this is not an issue
          "absolute inset-0 stripes-mask w-[130%] transform -translate-x-[15%]",
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
      <div className="relative z-1">{children}</div>
    </div>
  )
}
