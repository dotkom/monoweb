"use client"

import type { GradeType, SemesterKey } from "@dotkomonline/grades-backend/course"
import { Text, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { useFormatter, useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { usePeriodLabel } from "../../usePeriodLabel"

type GradeRangeBarProps = {
  min: { value: number; semester: SemesterKey }
  max: { value: number; semester: SemesterKey }
  mean: number
  value: number
  format: (n: number) => string
  mode: GradeType
  selectedPeriodLabel: string
  comparisonPeriodLabel: string
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

export function GradeRangeBar({
  min,
  max,
  mean,
  value,
  format,
  mode,
  selectedPeriodLabel,
  comparisonPeriodLabel,
}: GradeRangeBarProps) {
  const t = useTranslations("CoursePage.kpiCard.rangeBar")
  const formatter = useFormatter()
  const periodLabel = usePeriodLabel()

  const span = max.value - min.value || 1
  const pct = (n: number) => {
    const raw = ((n - min.value) / span) * 100
    return `${Math.min(100, Math.max(0, raw))}%`
  }

  const formatLabel = (n: number) => {
    if (mode === "LETTER") {
      return format(n)
    }

    return formatter.number(n / 100, {
      maximumFractionDigits: 0,
      style: "percent",
    })
  }

  const minSemester = periodLabel({ kind: "semester", semester: min.semester })
  const maxSemester = periodLabel({ kind: "semester", semester: max.semester })
  const minTooltip =
    mode === "LETTER" ? t("minAverage", { semester: minSemester }) : t("minPassRate", { semester: minSemester })
  const maxTooltip =
    mode === "LETTER" ? t("maxAverage", { semester: maxSemester }) : t("maxPassRate", { semester: maxSemester })
  const meanTooltip = t("periodValue", { period: comparisonPeriodLabel, value: formatLabel(mean) })
  const valueTooltip = t("periodValue", { period: selectedPeriodLabel, value: formatLabel(value) })

  // Don't show range bar if all grades are the same
  if (min === max) {
    return null
  }

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2">
      <RangeBarTooltip label={minTooltip}>
        <button
          type="button"
          aria-label={minTooltip}
          className="shrink-0 cursor-default text-xs text-neutral-500 tabular-nums dark:text-stone-400"
        >
          {formatLabel(min.value)}
        </button>
      </RangeBarTooltip>

      <div className="relative h-3 w-full min-w-0">
        <div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 rounded bg-neutral-200 dark:bg-stone-700" />

        <RangeBarTooltip label={meanTooltip}>
          <button
            type="button"
            aria-label={meanTooltip}
            className="absolute top-1/2 z-10 flex size-4 -translate-x-1/2 -translate-y-1/2 cursor-default items-center justify-center"
            style={{ left: pct(mean) }}
          >
            <span className="h-3 w-0.5 rounded bg-neutral-400 dark:bg-stone-500" />
          </button>
        </RangeBarTooltip>

        <RangeBarTooltip label={valueTooltip}>
          <button
            type="button"
            aria-label={valueTooltip}
            className="absolute top-1/2 z-20 size-2.5 -translate-x-1/2 -translate-y-1/2 cursor-default rounded-full bg-primary"
            style={{ left: pct(value) }}
          />
        </RangeBarTooltip>
      </div>

      <RangeBarTooltip label={maxTooltip}>
        <button
          type="button"
          aria-label={maxTooltip}
          className="shrink-0 cursor-default text-xs text-neutral-500 tabular-nums dark:text-stone-400"
        >
          {formatLabel(max.value)}
        </button>
      </RangeBarTooltip>

      <Text className="col-start-2 text-xs leading-snug text-pretty text-neutral-500 dark:text-stone-400">
        {t("historicalSpan")}
      </Text>
    </div>
  )
}
