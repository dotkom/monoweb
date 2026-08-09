"use client"

import { serializeSemesterKey } from "@dotkomonline/grades-backend/course"
import {
  sortGradeDistributionsByYearAndSemester,
  type GradeDistribution,
} from "@dotkomonline/grades-backend/grade-distribution"
import { cn, Select, SelectContent, SelectTrigger, SelectValue } from "@dotkomonline/ui"
import { Separator } from "@dotkomonline/ui/components/separator"
import { IconChevronDown } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { parseAsPeriodSelection } from "../course-page-params"
import { useCoursePeriodView } from "../useCoursePeriodView"
import { useFormatComparePeriodLabel, usePeriodLabel } from "../usePeriodLabel"
import { ComparisonSelectItem } from "./CourseKpiCard/ComparisonSelectItem"

type Props = {
  gradeDistributions: GradeDistribution[]
}

export function ComparisonSelect({ gradeDistributions }: Props) {
  const { periodSelection, comparisonPeriodSelection, setParams } = useCoursePeriodView(gradeDistributions)

  const t = useTranslations()
  const periodLabel = usePeriodLabel()
  const formatComparePeriodLabel = useFormatComparePeriodLabel()

  const comparisonValue =
    comparisonPeriodSelection.kind === "preset"
      ? comparisonPeriodSelection.preset
      : comparisonPeriodSelection.semester
        ? serializeSemesterKey(comparisonPeriodSelection.semester)
        : undefined

  return (
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
        aria-label={t("CoursePage.kpiCard.compareSelectAriaLabel")}
        icon={
          <IconChevronDown className="pointer-events-none size-3.5 text-neutral-500 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out sm:size-4 dark:text-stone-400" />
        }
        className={cn(
          "h-7 w-fit rounded-lg border-none px-2 text-xs sm:h-8 sm:px-3 sm:text-sm",
          "data-placeholder:text-foreground data-popup-open:[&_svg]:rotate-180",
          "bg-neutral-100 text-neutral-950 hover:bg-neutral-200/80",
          "dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
        )}
      >
        <SelectValue>
          <span className="sm:hidden">{formatComparePeriodLabel(comparisonPeriodSelection, "compact")}</span>
          <span className="hidden sm:inline">{formatComparePeriodLabel(comparisonPeriodSelection)}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-60 w-(--anchor-width) min-w-(--anchor-width) max-w-(--anchor-width) dark:border-stone-700 dark:bg-stone-800">
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
  )
}
