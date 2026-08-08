"use client"

import { cn, Text } from "@dotkomonline/ui"

const HOVER_INSET_PX = 2
const HOVER_RADIUS = 6

export const CHART_X_AXIS_HEIGHT = 17

export const CHART_SURFACE_CLASS = cn(
  "overflow-visible select-none text-muted-foreground outline-none",
  "**:select-none **:outline-none",
  "[&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none [&_svg]:outline-none",
  "[&_.recharts-wrapper]:focus:outline-none [&_.recharts-surface]:focus:outline-none [&_svg]:focus:outline-none",
  "[&_.recharts-wrapper]:overflow-visible [&_.recharts-surface]:overflow-visible [&_svg]:overflow-visible"
)

const TICK_FONT_SIZE = 12
const TICK_DY = -2

export type TickProps = {
  x?: number | string
  y?: number | string
  payload?: { value?: string }
}

export type CursorProps = {
  x?: number
  y?: number
  width?: number
  height?: number
}

export function GradeTick({ x, y, payload }: TickProps) {
  const tickX = Number(x)
  const tickY = Number(y)

  if (!Number.isFinite(tickX) || !Number.isFinite(tickY) || !payload?.value) {
    return null
  }

  return (
    <text
      x={tickX}
      y={tickY}
      dy={TICK_DY}
      textAnchor="middle"
      dominantBaseline="hanging"
      fill="currentColor"
      fontSize={TICK_FONT_SIZE}
      className="text-muted-foreground"
    >
      {payload.value}
    </text>
  )
}

export function SlotHoverCursor({ x, y, width, height }: CursorProps) {
  if (x == null || y == null || width == null || height == null) {
    return null
  }

  return (
    <rect
      x={x + HOVER_INSET_PX}
      y={y}
      width={Math.max(width - HOVER_INSET_PX * 2, 0)}
      height={height}
      rx={HOVER_RADIUS}
      fill="var(--muted-foreground)"
      fillOpacity={0.04}
      className="motion-safe:transition-opacity motion-safe:duration-150"
    />
  )
}

export function LegendSwatch({ label, variant }: { label: string; variant: "primary" | "ghost" }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "h-3 w-2.5 shrink-0 rounded-xs",
          variant === "primary" ? "bg-primary" : "bg-primary/20 dark:bg-primary/35"
        )}
        aria-hidden
      />
      <Text className="text-xs text-neutral-600 dark:text-stone-300">{label}</Text>
    </div>
  )
}
