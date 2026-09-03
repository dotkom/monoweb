"use client"

import { calculateCourseStatistics, type GradeDistribution } from "@dotkomonline/grades-backend/grade-distribution"
import { cn, Text } from "@dotkomonline/ui"
import { useFormatter, useTranslations } from "next-intl"
import { roundAverageGrade } from "../../../../../lib/format-stats"
import { useCoursePeriodView } from "../../useCoursePeriodView"
import { useFormatComparePeriodLabel } from "../../usePeriodLabel"
import { getPeriodCompareFlags } from "../../utils"
import { CourseSectionCard } from "../CourseSectionCard"
import { KpiMetric } from "./KpiMetric"

type Props = {
  gradeDistributions: GradeDistribution[]
  className?: string
}

export const CourseKpiCard = ({ gradeDistributions, className }: Props) => {
  const { comparisonPeriodSelection, selectedRows, comparisonRows } = useCoursePeriodView(gradeDistributions)

  const t = useTranslations()
  const format = useFormatter()
  const formatComparePeriodLabel = useFormatComparePeriodLabel()

  const formatNumber = (n: number) =>
    format.number(roundAverageGrade(n), { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const { showLetterKpi, showLetterDelta } = getPeriodCompareFlags(selectedRows, comparisonRows)

  return (
    <CourseSectionCard
      className={className}
      title={<Text className="font-medium text-sm dark:text-stone-200">{t("CoursePage.kpiCard.title")}</Text>}
      action={
        <Text className="text-sm dark:text-stone-200 tabular-nums mr-3">
          {t("CoursePage.kpiCard.candidateCount", { count: calculateCourseStatistics(selectedRows).candidateCount })}
        </Text>
      }
    >
      <div
        className={cn(
          "grid divide-gray-200 dark:divide-stone-700",
          showLetterKpi ? "grid-cols-2 divide-x" : "grid-cols-1"
        )}
      >
        {showLetterKpi && (
          <KpiMetric
            allGradeDistributions={gradeDistributions}
            selectedGradeDistributions={selectedRows}
            comparisonGradeDistributions={comparisonRows}
            className="pr-4 sm:pr-6"
            format={formatNumber}
            mode="LETTER"
            comparisonLabel={formatComparePeriodLabel(comparisonPeriodSelection, "inline")}
            showDelta={showLetterDelta}
            showRangeBarComparisonTick={showLetterDelta}
          />
        )}
        <KpiMetric
          allGradeDistributions={gradeDistributions}
          selectedGradeDistributions={selectedRows}
          comparisonGradeDistributions={comparisonRows}
          className={cn(showLetterKpi && "pl-4 sm:pl-6")}
          format={formatNumber}
          mode="PASS_FAIL"
          comparisonLabel={formatComparePeriodLabel(comparisonPeriodSelection, "inline")}
          showDelta={true}
          showRangeBarComparisonTick={true}
        />
      </div>
    </CourseSectionCard>
  )
}
