"use client"

import { Text } from "@dotkomonline/ui"
import { useTranslations } from "next-intl"
import { LegendSwatch } from "./grade-bar-chart-primitives"
import type { ChartRow } from "./use-grade-chart-data"

type Props = {
  showComparison: boolean
  primaryPeriodLabel: string
  comparisonPeriodLabel: string
  activeRow: ChartRow | null
  candidateCount: number
  formatPercent: (value: number) => string
}

export function GradeBarChartHeader({
  showComparison,
  primaryPeriodLabel,
  comparisonPeriodLabel,
  activeRow,
  candidateCount,
  formatPercent,
}: Props) {
  const t = useTranslations("CoursePage.barChart")

  return (
    <div className="flex min-h-5 items-center gap-3">
      {showComparison && (
        <div className="flex min-w-0 items-center gap-4">
          <LegendSwatch label={primaryPeriodLabel} variant="primary" />
          <LegendSwatch label={comparisonPeriodLabel} variant="ghost" />
        </div>
      )}

      <div className="ml-auto min-h-5 shrink-0 text-right text-sm text-muted-foreground">
        {activeRow ? (
          showComparison ? (
            <Text className="text-sm">
              {t("hoverCompare", {
                grade: activeRow.label,
                percent: formatPercent(activeRow.value),
                comparisonPercent: formatPercent(activeRow.ghostValue),
              })}
            </Text>
          ) : (
            <Text className="text-sm">
              {t("hoverOff", {
                grade: activeRow.label,
                percent: formatPercent(activeRow.value),
                count: activeRow.count,
                total: candidateCount,
              })}
            </Text>
          )
        ) : null}
      </div>
    </div>
  )
}
