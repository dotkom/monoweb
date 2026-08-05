"use client"

import { mapAverageGradeToLetterGrade, type GradeType } from "@dotkomonline/grades-backend/course"
import type { GradeDistribution } from "@dotkomonline/grades-backend/grade-distribution"
import { cn, Text, Title } from "@dotkomonline/ui"
import { IconArrowDownRight, IconArrowRight, IconArrowUpRight } from "@tabler/icons-react"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import { useMemo } from "react"
import { toAggregatedGradeDistribution } from "../../utils"
import { GradeRangeBar } from "./GradeRangeBar"
import { getCourseSemesterExtremes } from "./kpi-extremes"

type Props = {
  allGradeDistributions: GradeDistribution[]
  selectedGradeDistributions: GradeDistribution[]
  comparisonGradeDistributions: GradeDistribution[]
  className?: string
  format: (n: number) => string
  mode: GradeType
  comparisonLabel: string
  selectedPeriodLabel: string
  comparisonPeriodLabel: string
}

export function KpiMetric({
  allGradeDistributions,
  selectedGradeDistributions,
  comparisonGradeDistributions,
  className,
  format,
  mode,
  comparisonLabel,
  selectedPeriodLabel,
  comparisonPeriodLabel,
}: Props) {
  const t = useTranslations()
  const formatter = useFormatter()
  const locale = useLocale()

  const aggregatedGradeDistribution = useMemo(
    () => toAggregatedGradeDistribution(selectedGradeDistributions),
    [selectedGradeDistributions]
  )
  const comparisonAggregatedGradeDistribution = useMemo(
    () => toAggregatedGradeDistribution(comparisonGradeDistributions),
    [comparisonGradeDistributions]
  )

  const mainValue =
    mode === "LETTER"
      ? mapAverageGradeToLetterGrade(aggregatedGradeDistribution.averageGrade ?? 0)
      : Math.round(aggregatedGradeDistribution.passRate)

  const secondaryValue = formatter.number(aggregatedGradeDistribution.averageGrade ?? 0, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const parts = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  }).formatToParts(aggregatedGradeDistribution.passRate / 100)

  const selectedValue =
    mode === "PASS_FAIL" ? aggregatedGradeDistribution.passRate : (aggregatedGradeDistribution.averageGrade ?? 0)
  const comparisonMean =
    mode === "PASS_FAIL"
      ? comparisonAggregatedGradeDistribution.passRate
      : (comparisonAggregatedGradeDistribution.averageGrade ?? 0)

  const diff = selectedValue - comparisonMean
  const absDiff = Math.abs(diff)
  const passRateDiffPoints = Math.round(absDiff)
  const diffIsNeutral = mode === "PASS_FAIL" ? passRateDiffPoints === 0 : absDiff < 0.005
  const diffIsPositive = !diffIsNeutral && diff > 0
  const diffIsNegative = !diffIsNeutral && diff < 0

  const diffValueLabel = diffIsNeutral
    ? t("CoursePage.kpiCard.diffEqual")
    : mode === "PASS_FAIL"
      ? t("CoursePage.kpiCard.passRateDiff", { count: passRateDiffPoints })
      : format(absDiff)

  const extremes = useMemo(() => getCourseSemesterExtremes(allGradeDistributions, mode), [allGradeDistributions, mode])

  return (
    <div className={cn("flex flex-col gap-5 sm:gap-6", className)}>
      <div>
        <div className="flex flex-col gap-2">
          <Text className="text-sm font-medium text-neutral-500 dark:text-stone-400">
            {mode === "PASS_FAIL" ? t("CoursePage.kpiCard.passRate") : t("CoursePage.kpiCard.averageGrade")}
          </Text>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-baseline">
              <Title className="text-[54px] sm:text-[66px] font-bold leading-none tracking-tight text-neutral-950 tabular-nums dark:text-stone-50">
                {mode === "PASS_FAIL"
                  ? parts.map((part) =>
                      part.type === "percentSign" || part.type === "literal" ? (
                        <span
                          key={part.type + part.value}
                          className="text-[28px] font-medium text-neutral-400 dark:text-stone-500"
                        >
                          {part.value}
                        </span>
                      ) : (
                        <span key={part.type + part.value}>{part.value}</span>
                      )
                    )
                  : mainValue}
              </Title>
              {mode === "LETTER" && (
                <Text className="text-xl sm:text-2xl font-medium text-neutral-500 tabular-nums dark:text-stone-400">
                  {secondaryValue}
                </Text>
              )}
            </div>
            <div className="flex min-w-0 items-center gap-1">
              <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap">
                {diffIsPositive ? (
                  <IconArrowUpRight className="size-4 text-green-700 dark:text-green-400" />
                ) : diffIsNegative ? (
                  <IconArrowDownRight className="size-4 text-red-600 dark:text-red-400" />
                ) : (
                  <IconArrowRight className="size-4 text-neutral-400 dark:text-stone-500" />
                )}
                <Text
                  className={cn(
                    "text-sm",
                    diffIsPositive && "tabular-nums text-green-700 dark:text-green-400",
                    diffIsNegative && "tabular-nums text-red-600 dark:text-red-400",
                    diffIsNeutral && "text-neutral-400 dark:text-stone-500"
                  )}
                >
                  {diffValueLabel}
                </Text>
              </span>
              <Text className="hidden text-sm text-neutral-500 sm:inline dark:text-stone-400">{comparisonLabel}</Text>
            </div>
          </div>
        </div>
      </div>
      {extremes && (
        <div className="hidden sm:block">
          <GradeRangeBar
            min={extremes.min}
            max={extremes.max}
            mean={comparisonMean}
            value={selectedValue}
            format={format}
            mode={mode}
            selectedPeriodLabel={selectedPeriodLabel}
            comparisonPeriodLabel={comparisonPeriodLabel}
          />
        </div>
      )}
    </div>
  )
}
