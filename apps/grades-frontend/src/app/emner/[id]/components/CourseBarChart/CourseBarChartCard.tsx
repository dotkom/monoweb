"use client"

import { Layers2Icon } from "@/app/components/icons/Layers2Icon"
import type { GradeDistribution } from "@dotkomonline/grades-backend/grade-distribution"
import { Button, cn, Text, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { useCoursePeriodView } from "../../useCoursePeriodView"
import { useFormatComparePeriodLabel, usePeriodLabel } from "../../usePeriodLabel"
import { sameSemesters, toAggregatedGradeDistribution } from "../../utils"
import { CourseSectionCard } from "../CourseSectionCard"
import { GradeDistributionBarChart } from "./GradeDistributionBarChart"

type Props = {
  gradeDistributions: GradeDistribution[]
  className?: string
}

export const CourseBarChartCard = ({ gradeDistributions, className }: Props) => {
  const tBar = useTranslations("CoursePage.barChart")
  const periodLabel = usePeriodLabel()
  const formatComparePeriodLabel = useFormatComparePeriodLabel()
  const { params, setParams, periodSelection, comparisonPeriodSelection, selectedRows, comparisonRows } =
    useCoursePeriodView(gradeDistributions)

  const primary = useMemo(() => toAggregatedGradeDistribution(selectedRows), [selectedRows])
  const comparison = useMemo(() => {
    if (comparisonRows.length === 0 || sameSemesters(selectedRows, comparisonRows)) {
      return null
    }

    return toAggregatedGradeDistribution(comparisonRows)
  }, [selectedRows, comparisonRows])

  const primaryPeriodLabel = periodLabel(periodSelection)
  const comparisonPeriodLabel = formatComparePeriodLabel(comparisonPeriodSelection)

  const ghostEnabled = params.isGhost === true
  const canCompare = comparison !== null

  return (
    <CourseSectionCard
      className={className}
      title={tBar("title")}
      action={
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild disabled={canCompare}>
            <span className="inline-flex">
              <Button
                className={cn(
                  "cursor-pointer border-none text-sm font-normal transition-colors rounded-md",
                  ghostEnabled
                    ? "bg-neutral-100 text-neutral-950 hover:bg-neutral-200/80 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
                    : "text-muted-foreground hover:bg-neutral-100 dark:hover:bg-stone-700"
                )}
                disabled={!canCompare}
                onClick={() => setParams({ isGhost: !ghostEnabled })}
                variant="ghost"
                iconRight={<Layers2Icon className={cn("size-4 transition-colors")} />}
              >
                {tBar("compare")}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent
            className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-200"
            arrowClassName="dark:bg-stone-800"
          >
            <Text className="text-sm">{tBar("compareDisabledReason")}</Text>
          </TooltipContent>
        </Tooltip>
      }
    >
      <GradeDistributionBarChart
        primary={primary}
        comparison={comparison}
        ghostEnabled={ghostEnabled}
        primaryPeriodLabel={primaryPeriodLabel}
        comparisonPeriodLabel={comparisonPeriodLabel}
      />
    </CourseSectionCard>
  )
}
