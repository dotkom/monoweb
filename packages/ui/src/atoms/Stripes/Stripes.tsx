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
    <div className={cn("relative overflow-hidden", className)}>
      {/* Base color */}
      <div aria-hidden="true" className={cn("absolute inset-0", colorA)} />

      {/* Striped overlay */}
      <div
        aria-hidden="true"
        className={cn("absolute inset-0 stripes-mask", colorB, animated && "animate-stripes")}
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
