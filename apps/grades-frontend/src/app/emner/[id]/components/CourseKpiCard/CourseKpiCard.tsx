"use client"

import { serializeSemesterKey } from "@dotkomonline/grades-backend/course"
import {
  sortGradeDistributionsByYearAndSemester,
  type GradeDistribution,
} from "@dotkomonline/grades-backend/grade-distribution"
import { cn, Select, SelectContent, SelectTrigger, SelectValue, Text } from "@dotkomonline/ui"
import { Separator } from "@dotkomonline/ui/components/separator"
import { IconChevronDown } from "@tabler/icons-react"
import { useFormatter, useTranslations } from "next-intl"
import { parseAsPeriodSelection } from "../../course-page-params"
import { useCoursePeriodView } from "../../useCoursePeriodView"
import { useFormatComparePeriodLabel, usePeriodLabel } from "../../usePeriodLabel"
import { getPeriodCompareFlags } from "../../utils"
import { CourseSectionCard } from "../CourseSectionCard"
import { ComparisonSelectItem } from "./ComparisonSelectItem"
import { KpiMetric } from "./KpiMetric"

type Props = {
  gradeDistributions: GradeDistribution[]
  className?: string
}

export const CourseKpiCard = ({ gradeDistributions, className }: Props) => {
  const { periodSelection, comparisonPeriodSelection, setParams, selectedRows, comparisonRows } =
    useCoursePeriodView(gradeDistributions)

  const t = useTranslations()
  const format = useFormatter()
  const periodLabel = usePeriodLabel()
  const formatComparePeriodLabel = useFormatComparePeriodLabel()

  const formatNumber = (n: number) => format.number(n, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const selectedPeriodLabel = periodLabel(periodSelection)
  const comparisonLabel = formatComparePeriodLabel(comparisonPeriodSelection)

  const comparisonValue =
    comparisonPeriodSelection.kind === "preset"
      ? comparisonPeriodSelection.preset
      : comparisonPeriodSelection.semester
        ? serializeSemesterKey(comparisonPeriodSelection.semester)
        : undefined

  const { showLetterKpi, showLetterDelta } = getPeriodCompareFlags(selectedRows, comparisonRows)

  return (
    <CourseSectionCard
      className={className}
      title={<Text className="font-medium text-sm dark:text-stone-200">{selectedPeriodLabel}</Text>}
      action={
        <Select
          value={comparisonValue}
          onValueChange={(value: string | null) => {
            if (value == null) {
              return
            }

            const selection = parseAsPeriodSelection.parse(value)
            if (!selection) {
              return
            }

            setParams({ vs: selection })
          }}
        >
          <SelectTrigger
            icon={
              <IconChevronDown className="pointer-events-none size-4 text-neutral-500 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out dark:text-stone-400" />
            }
            className={cn(
              "border-none rounded-md h-8",
              "data-placeholder:text-foreground data-popup-open:[&_svg]:rotate-180",
              "bg-neutral-100 text-neutral-950 hover:bg-neutral-200/80",
              "dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
            )}
          >
            <SelectValue>{comparisonLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60 w-(--anchor-width) min-w-(--anchor-width) max-w-(--anchor-width) dark:bg-stone-800 dark:border-stone-700">
            <ComparisonSelectItem
              value="LAST_THREE_YEARS"
              selection={{ kind: "preset", preset: "LAST_THREE_YEARS" }}
              periodSelection={periodSelection}
              disabledReason={t("CoursePage.kpiCard.comparisonSameAsPeriod")}
            >
              {t("Enums.PeriodPreset.LAST_THREE_YEARS")}
            </ComparisonSelectItem>

            <ComparisonSelectItem
              value="ALL_YEARS"
              selection={{ kind: "preset", preset: "ALL_YEARS" }}
              periodSelection={periodSelection}
              disabledReason={t("CoursePage.kpiCard.comparisonSameAsPeriod")}
            >
              {t("Enums.PeriodPreset.ALL_YEARS")}
            </ComparisonSelectItem>

            <Separator className="my-1 dark:bg-stone-700" />

            {sortGradeDistributionsByYearAndSemester(gradeDistributions).map((ref) => {
              const semester = { year: ref.year, semester: ref.semester }
              const selection = { kind: "semester" as const, semester }

              return (
                <ComparisonSelectItem
                  key={serializeSemesterKey(semester)}
                  value={serializeSemesterKey(semester)}
                  selection={selection}
                  periodSelection={periodSelection}
                  disabledReason={t("CoursePage.kpiCard.comparisonSameAsPeriod")}
                >
                  {periodLabel(selection)}
                </ComparisonSelectItem>
              )
            })}
          </SelectContent>
        </Select>
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
            comparisonLabel={formatComparePeriodLabel(comparisonPeriodSelection, true)}
            selectedPeriodLabel={selectedPeriodLabel}
            comparisonPeriodLabel={periodLabel(comparisonPeriodSelection)}
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
          comparisonLabel={formatComparePeriodLabel(comparisonPeriodSelection, true)}
          selectedPeriodLabel={selectedPeriodLabel}
          comparisonPeriodLabel={periodLabel(comparisonPeriodSelection)}
          showDelta={true}
          showRangeBarComparisonTick={true}
        />
      </div>
    </CourseSectionCard>
  )
}
