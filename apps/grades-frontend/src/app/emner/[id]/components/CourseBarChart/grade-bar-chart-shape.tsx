"use client"

import { cn } from "@dotkomonline/ui"
import {
  ABOVE_LABEL_GAP,
  BAR_RADIUS,
  barGeometry,
  LABEL_OFFSET_FROM_TOP,
  MIN_INSIDE_LABEL_BAR_HEIGHT_PX,
  MIN_INSIDE_LABEL_BAR_WIDTH_PX,
  topRoundedRectPath,
} from "./grade-bar-chart-geometry"
import type { ChartRow } from "./use-grade-chart-data"

const GHOST_FILL_CLASS = "fill-primary/20 dark:fill-primary/35"
const BAR_TRANSITION_CLASS = "motion-safe:transition-[x,width] motion-safe:duration-200 motion-safe:ease-out"

export type ShapeProps = {
  x?: number | string
  y?: number | string
  width?: number | string
  height?: number | string
  payload?: ChartRow
  showComparison: boolean
  formatPercent: (value: number) => string
}

function barHeights(payload: ChartRow, slotTop: number, slotHeight: number) {
  const chartBaseline = slotTop + slotHeight
  const scale = payload.plotValue > 0 ? payload.plotValue : 1
  const primaryHeight = (payload.value / scale) * slotHeight
  const ghostHeight = (payload.ghostValue / scale) * slotHeight

  return {
    primaryHeight,
    ghostHeight,
    primaryY: chartBaseline - primaryHeight,
    ghostY: chartBaseline - ghostHeight,
  }
}

function labelPosition({
  primaryHeight,
  primaryWidth,
  groupTop,
  primaryY,
}: {
  primaryHeight: number
  primaryWidth: number
  groupTop: number
  primaryY: number
}) {
  const placeAbove =
    primaryHeight > 0 &&
    (primaryHeight < MIN_INSIDE_LABEL_BAR_HEIGHT_PX || primaryWidth < MIN_INSIDE_LABEL_BAR_WIDTH_PX)
  const labelY = placeAbove ? groupTop - ABOVE_LABEL_GAP : primaryY + LABEL_OFFSET_FROM_TOP

  return { placeAbove, labelY }
}

export function DistributionBarShape({ x, y, width, height, payload, showComparison, formatPercent }: ShapeProps) {
  const slotX = Number(x)
  const slotTop = Number(y)
  const slotWidth = Number(width)
  const slotHeight = Number(height)

  if (
    !payload ||
    !Number.isFinite(slotX) ||
    !Number.isFinite(slotTop) ||
    !Number.isFinite(slotWidth) ||
    !Number.isFinite(slotHeight) ||
    slotHeight <= 0
  ) {
    return null
  }

  const { primaryHeight, ghostHeight, primaryY, ghostY } = barHeights(payload, slotTop, slotHeight)
  const { ghostX, ghostWidth, primaryX, primaryWidth } = barGeometry(slotX, slotWidth, showComparison)

  const groupTop = ghostHeight > 0 ? Math.min(primaryY, ghostY) : primaryY
  const { placeAbove, labelY } = labelPosition({ primaryHeight, primaryWidth, groupTop, primaryY })

  return (
    <g>
      {ghostHeight > 0 ? (
        <path
          d={topRoundedRectPath(ghostX, ghostY, ghostWidth, ghostHeight, BAR_RADIUS)}
          className={cn(BAR_TRANSITION_CLASS, GHOST_FILL_CLASS)}
        />
      ) : null}

      {primaryHeight > 0 ? (
        <path
          d={topRoundedRectPath(primaryX, primaryY, primaryWidth, primaryHeight, BAR_RADIUS)}
          fill="var(--color-brand)"
          className={BAR_TRANSITION_CLASS}
        />
      ) : null}

      {payload.value > 0 ? (
        <text
          x={primaryX + primaryWidth / 2}
          y={labelY}
          textAnchor="middle"
          dominantBaseline={placeAbove ? "auto" : "hanging"}
          fill={placeAbove ? "currentColor" : "var(--primary-foreground)"}
          fontSize={12}
          fontWeight={500}
          className={placeAbove ? "text-foreground" : undefined}
        >
          {formatPercent(payload.value)}
        </text>
      ) : null}
    </g>
  )
}
