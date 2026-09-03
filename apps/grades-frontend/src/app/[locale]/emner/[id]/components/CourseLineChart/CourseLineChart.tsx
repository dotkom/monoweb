"use client"

import { cn } from "@dotkomonline/ui"
import { useFormatter } from "next-intl"
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type MouseHandlerDataParam,
} from "recharts"
import { roundAverageGrade, roundPassRate } from "../../../../../lib/format-stats"
import { CHART_SURFACE_CLASS, CHART_X_AXIS_HEIGHT, GradeTick } from "../CourseBarChart/grade-bar-chart-primitives"
import { NullFloorDot, SelectionDot } from "./line-chart-selection-dot"

const CHART_PLOT_MARGIN = 5

export type CourseLineChartMode = "LETTER" | "PASS_FAIL"

export type CourseLineChartPoint = {
  id: string
  label: string
  value: number | null
}

type Props = {
  mode: CourseLineChartMode
  points: CourseLineChartPoint[]
  selectedIds: string[]
  onPointClick: (pointId: string) => void
  className?: string
}

const LETTER_Y_TICKS = [0, 1, 2, 3, 4, 5] as const
const LETTER_Y_LABELS: Record<(typeof LETTER_Y_TICKS)[number], string> = {
  0: "F",
  1: "E",
  2: "D",
  3: "C",
  4: "B",
  5: "A",
}

const PASS_RATE_Y_TICKS = [0, 25, 50, 75, 100] as const

const LINE_TYPE = "monotoneX" as const
const PRIMARY_STROKE = "var(--primary)"
const HISTORY_STROKE = "var(--chart-history)"
const LINE_STROKE_WIDTH = 1.8
const MAX_X_TICKS = 8
const HOVER_DOT_RADIUS = 4.5
const GRID_STROKE_OPACITY = 0.07
const Y_AXIS_TICK_MARGIN = 8

function getFocusPoint(points: CourseLineChartPoint[], selectedIds: string[]): CourseLineChartPoint | null {
  if (selectedIds.length !== 1) {
    return null
  }

  return points.find((point) => point.id === selectedIds[0]) ?? null
}

function getSelectionIndexRange(points: CourseLineChartPoint[], selectedIds: string[]) {
  if (selectedIds.length === 0 || points.length === 0) {
    return null
  }

  const selected = new Set(selectedIds)
  let start = -1
  let end = -1

  for (let index = 0; index < points.length; index++) {
    if (!selected.has(points[index].id)) {
      continue
    }

    if (start === -1) {
      start = index
    }
    end = index
  }

  if (start === -1) {
    return null
  }

  return { start, end }
}

function getPeriodStrokeStops(
  pointCount: number,
  selection: { start: number; end: number }
): { id: string; offset: number; color: string }[] {
  const lastIndex = pointCount - 1
  const toPct = (index: number) => (index / lastIndex) * 100
  const startPct = toPct(selection.start)
  const endPct = selection.end >= lastIndex ? 100 : toPct(selection.end)
  const stops: { id: string; offset: number; color: string }[] = []

  if (selection.start > 0) {
    stops.push({ id: "before-start", offset: 0, color: HISTORY_STROKE })
    stops.push({ id: "before-end", offset: startPct, color: HISTORY_STROKE })
  }

  stops.push({ id: "primary-start", offset: startPct, color: PRIMARY_STROKE })
  stops.push({ id: "primary-end", offset: endPct, color: PRIMARY_STROKE })

  if (endPct < 100) {
    stops.push({ id: "after-start", offset: endPct, color: HISTORY_STROKE })
    stops.push({ id: "after-end", offset: 100, color: HISTORY_STROKE })
  }

  return stops
}

function getEvenXTickLabels(points: CourseLineChartPoint[], maxTicks: number) {
  if (points.length === 0) {
    return []
  }

  if (points.length <= maxTicks) {
    return points.map((point) => point.label)
  }

  const lastIndex = points.length - 1
  const step = Math.ceil(lastIndex / (maxTicks - 1))
  const labels: string[] = []

  for (let index = 0; index < lastIndex; index += step) {
    labels.push(points[index].label)
  }

  const lastLabel = points[lastIndex].label
  if (labels[labels.length - 1] !== lastLabel) {
    labels.push(lastLabel)
  }

  return labels
}

function estimateYAxisWidth(mode: CourseLineChartMode) {
  return mode === "PASS_FAIL" ? Y_AXIS_TICK_MARGIN + 36 : Y_AXIS_TICK_MARGIN + 12
}

function formatMetricValue(format: ReturnType<typeof useFormatter>, mode: CourseLineChartMode, value: number) {
  if (mode === "LETTER") {
    return format.number(roundAverageGrade(value), { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return format.number(roundPassRate(value) / 100, { style: "percent", maximumFractionDigits: 0 })
}

function resolvePointIdFromChartEvent(state: MouseHandlerDataParam, points: CourseLineChartPoint[]): string | null {
  if (!state.isTooltipActive || state.activeCoordinate == null) {
    return null
  }

  const rawIndex = state.activeTooltipIndex ?? state.activeIndex
  const index = typeof rawIndex === "number" ? rawIndex : Number(rawIndex)

  if (Number.isInteger(index) && index >= 0 && index < points.length) {
    return points[index]?.id ?? null
  }

  if (state.activeLabel != null) {
    return points.find((point) => point.label === String(state.activeLabel))?.id ?? null
  }

  return null
}

export function CourseLineChart({ mode, points, selectedIds, onPointClick, className }: Props) {
  const format = useFormatter()
  const strokeGradientId = `stroke-${useId().replace(/:/g, "")}`
  const containerRef = useRef<HTMLDivElement>(null)
  const [chartWidth, setChartWidth] = useState(0)

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) {
      return
    }

    const updateWidth = () => {
      setChartWidth(element.clientWidth)
    }

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  const isSingleSelection = selectedIds.length === 1
  const selectionCoversAll = selectedIds.length > 0 && points.every((point) => selectedIds.includes(point.id))
  const highlightPeriod = selectedIds.length > 1 && !selectionCoversAll

  const focusPoint = useMemo(() => getFocusPoint(points, selectedIds), [points, selectedIds])
  const selectionRange = useMemo(() => getSelectionIndexRange(points, selectedIds), [points, selectedIds])
  const xTickLabels = useMemo(() => getEvenXTickLabels(points, MAX_X_TICKS), [points])

  const periodStrokeStops = useMemo(() => {
    if (!highlightPeriod || !selectionRange || points.length <= 1) {
      return null
    }

    return getPeriodStrokeStops(points.length, selectionRange)
  }, [highlightPeriod, points.length, selectionRange])

  const focusLabel =
    focusPoint == null || focusPoint.value == null ? null : formatMetricValue(format, mode, focusPoint.value)
  const focusId = focusPoint?.id ?? null
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const nullPoints = useMemo(() => points.filter((point) => point.value == null), [points])

  const yTicks = mode === "LETTER" ? [...LETTER_Y_TICKS] : [...PASS_RATE_Y_TICKS]
  const yDomain: [number, number] = mode === "LETTER" ? [0, 5] : [0, 100]
  const yAxisWidth = estimateYAxisWidth(mode)

  const formatYTick = (value: number) => {
    if (mode === "LETTER") {
      return LETTER_Y_LABELS[value as (typeof LETTER_Y_TICKS)[number]] ?? ""
    }

    return format.number(roundPassRate(value) / 100, { style: "percent", maximumFractionDigits: 0 })
  }

  const lineStroke = periodStrokeStops ? `url(#${strokeGradientId})` : HISTORY_STROKE

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: block text/focus selection; clicks only move the semester dot
    <div
      ref={containerRef}
      className={cn(
        "min-h-40 w-full flex-1 cursor-pointer!",
        "[&_.recharts-wrapper]:cursor-pointer! [&_svg]:cursor-pointer! **:cursor-pointer!",
        "[&_.recharts-wrapper]:overflow-visible! [&_.recharts-surface]:overflow-visible! [&_svg]:overflow-visible!",
        CHART_SURFACE_CLASS,
        className
      )}
      style={{ cursor: "pointer" }}
      onMouseDown={(event) => {
        event.preventDefault()
      }}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 480, height: 160 }}
        className="overflow-visible!"
      >
        <LineChart
          data={points}
          margin={{ top: 4, right: CHART_PLOT_MARGIN, left: CHART_PLOT_MARGIN, bottom: 0 }}
          accessibilityLayer={false}
          tabIndex={-1}
          className="cursor-pointer! outline-none"
          style={{ userSelect: "none", cursor: "pointer" }}
          onClick={(state) => {
            const id = resolvePointIdFromChartEvent(state, points)
            if (id) {
              onPointClick(id)
            }
          }}
        >
          {periodStrokeStops && (
            <defs>
              <linearGradient id={strokeGradientId} x1="0" y1="0" x2="1" y2="0">
                {periodStrokeStops.map((stop) => (
                  <stop key={stop.id} offset={`${stop.offset}%`} stopColor={stop.color} />
                ))}
              </linearGradient>
            </defs>
          )}

          <CartesianGrid
            vertical={false}
            horizontalValues={yTicks}
            syncWithTicks
            stroke="currentColor"
            strokeOpacity={GRID_STROKE_OPACITY}
            strokeWidth={1}
          />

          <XAxis
            dataKey="label"
            ticks={xTickLabels}
            tickLine={false}
            axisLine={false}
            height={CHART_X_AXIS_HEIGHT}
            tickMargin={0}
            tick={<GradeTick />}
            interval={0}
            padding={{ left: 0, right: 0 }}
          />

          <YAxis
            type="number"
            domain={yDomain}
            ticks={yTicks}
            tickLine={false}
            axisLine={false}
            width={yAxisWidth}
            tickMargin={Y_AXIS_TICK_MARGIN}
            tick={{ fontSize: 12 }}
            tickFormatter={formatYTick}
            interval={0}
            minTickGap={0}
          />

          <Tooltip cursor={false} content={() => null} />

          <Line
            type={LINE_TYPE}
            dataKey="value"
            stroke={lineStroke}
            strokeWidth={LINE_STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ cursor: "pointer" }}
            dot={(dotProps) => {
              const payload = dotProps.payload as CourseLineChartPoint | undefined
              if (payload?.value == null) {
                return null
              }

              return (
                <SelectionDot
                  cx={dotProps.cx}
                  cy={dotProps.cy}
                  payload={payload}
                  focusId={focusId}
                  label={focusLabel}
                  showPrimaryDot={isSingleSelection}
                  inSelectedPeriod={highlightPeriod && selectedIdSet.has(payload.id)}
                  chartWidth={chartWidth}
                />
              )
            }}
            activeDot={(dotProps) => {
              const payload = dotProps.payload as CourseLineChartPoint | undefined
              if (isSingleSelection && payload?.id === focusId) {
                return null
              }

              if (dotProps.cx == null || dotProps.cy == null || payload?.value == null) {
                return null
              }

              return (
                <circle
                  cx={dotProps.cx}
                  cy={dotProps.cy}
                  r={HOVER_DOT_RADIUS}
                  fill={PRIMARY_STROKE}
                  style={{ cursor: "pointer" }}
                />
              )
            }}
            isAnimationActive={false}
          />

          {nullPoints.map((point) => (
            <ReferenceDot
              key={point.id}
              x={point.label}
              y={0}
              ifOverflow="visible"
              shape={(shapeProps) => (
                <NullFloorDot
                  cx={shapeProps.cx}
                  cy={shapeProps.cy}
                  focused={isSingleSelection && point.id === focusId}
                  inSelectedPeriod={highlightPeriod && selectedIdSet.has(point.id)}
                  onSelect={() => onPointClick(point.id)}
                />
              )}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
