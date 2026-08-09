"use client"

import { cn } from "@dotkomonline/ui"
import { useTranslations } from "next-intl"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { AggregatedGradeDistribution } from "../../utils"
import { GradeTick, SlotHoverCursor } from "./grade-bar-chart-primitives"
import { DistributionBarShape } from "./grade-bar-chart-shape"
import { GradeBarChartHeader } from "./GradeBarChartHeader"
import { useGradeChartData } from "./use-grade-chart-data"

type Props = {
  primary: AggregatedGradeDistribution
  comparison: AggregatedGradeDistribution | null
  ghostEnabled: boolean
  primaryPeriodLabel: string
  comparisonPeriodLabel: string
}

export function GradeDistributionBarChart({
  primary,
  comparison,
  ghostEnabled,
  primaryPeriodLabel,
  comparisonPeriodLabel,
}: Props) {
  const t = useTranslations("CoursePage.barChart")
  const { data, yMax, activeRow, setActiveField, showComparison, formatPercent } = useGradeChartData({
    primary,
    comparison,
    ghostEnabled,
    t,
  })

  const baseline = { x1: 0, x2: 0, y: 0 }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <GradeBarChartHeader
        showComparison={showComparison}
        primaryPeriodLabel={primaryPeriodLabel}
        comparisonPeriodLabel={comparisonPeriodLabel}
        activeRow={activeRow}
        candidateCount={primary.candidateCount}
        formatPercent={formatPercent}
      />

      {/* biome-ignore lint/a11y/noStaticElementInteractions: block text/focus selection on Recharts SVG */}
      <div
        className={cn(
          "min-h-56 w-full flex-1 select-none text-muted-foreground outline-none lg:min-h-0",
          "**:select-none **:outline-none",
          "[&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none [&_svg]:outline-none",
          "[&_.recharts-wrapper]:focus:outline-none [&_.recharts-surface]:focus:outline-none [&_svg]:focus:outline-none"
        )}
        onMouseDown={(event) => {
          event.preventDefault()
        }}
      >
        <ResponsiveContainer width="100%" height="100%" debounce={50} initialDimension={{ width: 480, height: 224 }}>
          <BarChart
            data={data}
            barCategoryGap="10%"
            maxBarSize={100}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            accessibilityLayer={false}
            tabIndex={-1}
            className="outline-none"
            style={{ userSelect: "none" }}
            onMouseMove={(state) => {
              const label = state?.activeLabel
              if (typeof label !== "string") {
                return
              }

              const row = data.find((item) => item.label === label)
              if (row) {
                setActiveField(row.field)
              }
            }}
            onMouseLeave={() => setActiveField(null)}
          >
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={<GradeTick />}
              className="text-muted-foreground"
            />
            <YAxis hide domain={[0, yMax]} />
            <Tooltip cursor={<SlotHoverCursor />} content={() => null} shared />
            <Bar
              dataKey="plotValue"
              isAnimationActive={false}
              shape={(props) => {
                const lastIndex = data.length - 1

                // Draw a baseline from the first bar to the last bar
                if (props.index === 0) {
                  baseline.x1 = props.x
                  baseline.y = props.y + props.height
                }

                if (props.index === lastIndex) {
                  baseline.x2 = props.x + props.width
                }

                return (
                  <g>
                    <DistributionBarShape {...props} showComparison={showComparison} formatPercent={formatPercent} />
                    {props.index === lastIndex && (
                      <line
                        x1={baseline.x1}
                        x2={baseline.x2}
                        y1={baseline.y}
                        y2={baseline.y}
                        stroke="currentColor"
                        strokeWidth={1}
                      />
                    )}
                  </g>
                )
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
