"use client"

import { DefaultZIndexes, ZIndexLayer } from "recharts"

const PRIMARY_FILL = "var(--primary)"
const HISTORY_FILL = "var(--chart-history)"
const HISTORY_DOT_RADIUS = 2.5
const SELECTION_DOT_RADIUS = 5
const NULL_FLOOR_HIT_RADIUS = 8
const HISTORY_RING_STROKE_WIDTH = 1.5
const LABEL_CARD_HEIGHT = 22
const LABEL_CARD_PAD_X = 7
const LABEL_CARD_GAP = 10
const LABEL_CARD_RADIUS = 5
const LABEL_CHAR_WIDTH = 7
const LABEL_FONT_SIZE = 12

function estimateLabelCardWidth(label: string) {
  return Math.ceil(label.length * LABEL_CHAR_WIDTH + LABEL_CARD_PAD_X * 2)
}

function clampLabelCardX(cx: number, cardWidth: number, chartWidth: number) {
  if (chartWidth <= 0 || cardWidth <= 0) {
    return cx - cardWidth / 2
  }

  const idealX = cx - cardWidth / 2
  const maxX = Math.max(chartWidth - cardWidth, 0)

  return Math.min(Math.max(idealX, 0), maxX)
}

type SelectionDotProps = {
  cx?: number
  cy?: number
  payload?: { id: string; value?: number | null }
  focusId: string | null
  label: string | null
  showPrimaryDot: boolean
  inSelectedPeriod?: boolean
  chartWidth: number
}

export function SelectionDot({
  cx,
  cy,
  payload,
  focusId,
  label,
  showPrimaryDot,
  inSelectedPeriod = false,
  chartWidth,
}: SelectionDotProps) {
  if (cx == null || cy == null || !payload || payload.value == null) {
    return null
  }

  const isFocused = showPrimaryDot && payload.id === focusId

  if (isFocused) {
    const cardWidth = label ? estimateLabelCardWidth(label) : 0
    const cardX = label ? clampLabelCardX(cx, cardWidth, chartWidth) : 0
    const cardY = cy - SELECTION_DOT_RADIUS - LABEL_CARD_GAP - LABEL_CARD_HEIGHT
    const labelCenterX = cardX + cardWidth / 2

    return (
      <ZIndexLayer zIndex={DefaultZIndexes.label}>
        <g onPointerDown={(event) => event.stopPropagation()}>
          <circle cx={cx} cy={cy} r={SELECTION_DOT_RADIUS} fill={PRIMARY_FILL} />
          {label && (
            <g>
              <rect
                x={cardX}
                y={cardY}
                width={cardWidth}
                height={LABEL_CARD_HEIGHT}
                rx={LABEL_CARD_RADIUS}
                className="fill-card stroke-neutral-200 dark:fill-stone-700 dark:stroke-stone-600"
                strokeWidth={1}
              />
              <text
                x={labelCenterX}
                y={cardY + LABEL_CARD_HEIGHT / 2}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-foreground"
                style={{ fontSize: LABEL_FONT_SIZE, fontWeight: 500 }}
              >
                {label}
              </text>
            </g>
          )}
        </g>
      </ZIndexLayer>
    )
  }

  return <circle cx={cx} cy={cy} r={HISTORY_DOT_RADIUS} fill={inSelectedPeriod ? PRIMARY_FILL : HISTORY_FILL} />
}

type NullFloorDotProps = {
  cx?: number
  cy?: number
  focused?: boolean
  inSelectedPeriod?: boolean
  onSelect?: () => void
}

export function NullFloorDot({ cx, cy, focused = false, inSelectedPeriod = false, onSelect }: NullFloorDotProps) {
  if (cx == null || cy == null) {
    return null
  }

  const filled = focused || inSelectedPeriod
  const radius = focused ? SELECTION_DOT_RADIUS : HISTORY_DOT_RADIUS

  const markCy = cy - radius

  return (
    <ZIndexLayer zIndex={DefaultZIndexes.label}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: SVG hit target for chart point selection */}
      <g
        style={{ cursor: "pointer" }}
        onClick={(event) => {
          event.stopPropagation()
          onSelect?.()
        }}
        onPointerDown={(event) => {
          event.stopPropagation()
        }}
      >
        <circle cx={cx} cy={markCy} r={NULL_FLOOR_HIT_RADIUS} fill="transparent" />
        {filled ? (
          <circle cx={cx} cy={markCy} r={radius} fill={PRIMARY_FILL} />
        ) : (
          <circle
            cx={cx}
            cy={markCy}
            r={radius}
            stroke={HISTORY_FILL}
            strokeWidth={HISTORY_RING_STROKE_WIDTH}
            className="fill-card dark:fill-stone-800"
          />
        )}
      </g>
    </ZIndexLayer>
  )
}
