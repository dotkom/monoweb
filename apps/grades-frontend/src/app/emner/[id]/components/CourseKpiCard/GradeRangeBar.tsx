"use client"

import type { GradeType, SemesterKey } from "@dotkomonline/grades-backend/course"
import { cn, Text, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { roundAverageGrade, roundPassRate } from "@/app/lib/format-stats"
import { usePeriodLabel } from "../../usePeriodLabel"

/** Hide value label when this close to the min/max ends. */
const VALUE_EDGE_HIDE_GAP_PCT = 6

type GradeRangeBarProps = {
  min: { value: number; semester: SemesterKey }
  max: { value: number; semester: SemesterKey }
  mean: number
  value: number
  format: (n: number) => string
  mode: GradeType
  showComparisonTick: boolean
  diff: "positive" | "negative" | "neutral"
}

export function GradeRangeBar({ min, max, mean, value, format, mode, showComparisonTick, diff }: GradeRangeBarProps) {
  const t = useTranslations("CoursePage.kpiCard.rangeBar")
  const tBar = useTranslations("CoursePage.barChart")
  const periodLabel = usePeriodLabel()

  const span = max.value - min.value || 1
  const toPct = (n: number) => Math.min(100, Math.max(0, ((n - min.value) / span) * 100))

  const toLeftPct = (n: number) => `${toPct(n)}%`

  const toWidthPct = (start: number, end: number) => {
    const raw = ((end - start) / span) * 100
    return `${Math.min(100, Math.max(0, raw))}%`
  }

  const formatLabel = (n: number) => {
    if (mode === "LETTER") {
      return format(roundAverageGrade(n))
    }

    return tBar("percent", { value: roundPassRate(n) })
  }

  const valuePct = toPct(value)
  const showValueLabel = valuePct >= VALUE_EDGE_HIDE_GAP_PCT && valuePct <= 100 - VALUE_EDGE_HIDE_GAP_PCT

  const minSemester = periodLabel({ kind: "semester", semester: min.semester })
  const maxSemester = periodLabel({ kind: "semester", semester: max.semester })

  const minTooltip =
    mode === "LETTER" ? t("minAverage", { semester: minSemester }) : t("minPassRate", { semester: minSemester })
  const maxTooltip =
    mode === "LETTER" ? t("maxAverage", { semester: maxSemester }) : t("maxPassRate", { semester: maxSemester })

  // Don't show range bar if all grades are the same
  if (min === max) {
    return null
  }

  return (
    <div className="grid grid-cols-[auto_1fr_auto] gap-x-2">
      <RangeBarTooltip label={minTooltip}>
        <button
          type="button"
          aria-label={minTooltip}
          className="flex h-3 shrink-0 cursor-default items-center self-start text-xs text-neutral-500 tabular-nums dark:text-stone-400"
        >
          {formatLabel(min.value)}
        </button>
      </RangeBarTooltip>

      <div className="min-w-0">
        <div className="relative h-3">
          <div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 rounded bg-neutral-200 dark:bg-stone-700" />

          {showComparisonTick && (
            <>
              {diff === "positive" ? (
                <div
                  className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 rounded bg-green-600/70 dark:bg-green-500/65"
                  style={{ left: toLeftPct(mean), width: toWidthPct(mean, value) }}
                />
              ) : (
                diff === "negative" && (
                  <div
                    className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 rounded bg-red-600/60 dark:bg-red-500/70"
                    style={{ left: toLeftPct(value), width: toWidthPct(value, mean) }}
                  />
                )
              )}

              <div
                className="absolute top-1/2 z-10 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded bg-neutral-400 dark:bg-stone-500"
                style={{ left: toLeftPct(mean) }}
              />
            </>
          )}

          <div
            className={cn(
              "absolute top-1/2 z-20 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full",
              !showComparisonTick || diff === "neutral"
                ? "bg-neutral-500 dark:bg-stone-400"
                : diff === "positive"
                  ? "bg-green-600 dark:bg-green-500"
                  : "bg-red-600 dark:bg-red-500"
            )}
            style={{ left: toLeftPct(value) }}
          />
        </div>

        <div className="relative mt-1 h-3">
          {showValueLabel && (
            <MarkerLabel
              leftPct={valuePct}
              className={cn(
                !showComparisonTick || diff === "neutral"
                  ? "text-neutral-500 dark:text-stone-400"
                  : diff === "positive"
                    ? "text-green-700 dark:text-green-400"
                    : "text-red-700 dark:text-red-400"
              )}
            >
              {formatLabel(value)}
            </MarkerLabel>
          )}
        </div>
      </div>

      <RangeBarTooltip label={maxTooltip}>
        <button
          type="button"
          aria-label={maxTooltip}
          className="flex h-3 shrink-0 cursor-default items-center self-start text-xs text-neutral-500 tabular-nums dark:text-stone-400"
        >
          {formatLabel(max.value)}
        </button>
      </RangeBarTooltip>
    </div>
  )
}

function MarkerLabel({ leftPct, className, children }: { leftPct: number; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute top-0 -translate-x-1/2 whitespace-nowrap text-xs leading-none tabular-nums",
        className
      )}
      style={{ left: `${leftPct}%` }}
    >
      {children}
    </span>
  )
}

function RangeBarTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-200"
        arrowClassName="dark:bg-stone-800"
      >
        <Text className="text-sm">{label}</Text>
      </TooltipContent>
    </Tooltip>
  )
}
