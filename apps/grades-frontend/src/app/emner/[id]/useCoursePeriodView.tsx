import type { GradeDistribution } from "@dotkomonline/grades-backend/grade-distribution"
import { useQueryStates } from "nuqs"
import { useEffect } from "react"
import { CoursePageParsers, type PeriodSelection } from "./course-page-params"
import {
  getFallbackComparisonPeriodSelection,
  getGradeDistributionsForSelection,
  isSamePeriodSelection,
  resolvePeriodSelection,
} from "./utils"

export function useCoursePeriodView(gradeDistributions: GradeDistribution[]) {
  const [params, setParams] = useQueryStates(CoursePageParsers)

  const periodSelection = resolvePeriodSelection(params.period, gradeDistributions)
  let comparisonPeriodSelection = resolvePeriodSelection(params.compare, gradeDistributions)

  if (isSamePeriodSelection(periodSelection, comparisonPeriodSelection)) {
    comparisonPeriodSelection = getFallbackComparisonPeriodSelection(periodSelection)
  }

  const selectedRows = getGradeDistributionsForSelection(periodSelection, gradeDistributions)
  const comparisonRows = getGradeDistributionsForSelection(comparisonPeriodSelection, gradeDistributions)

  const setPeriod = (period: PeriodSelection) => {
    // If the new period is the same as the comparison period, update the comparison period to a fallback
    const nextCompare = isSamePeriodSelection(period, comparisonPeriodSelection)
      ? getFallbackComparisonPeriodSelection(period)
      : comparisonPeriodSelection

    setParams({ period, compare: nextCompare })
  }

  // If the period or comparison period is changed during resolution, update the query params
  useEffect(() => {
    const periodNeedsFix = params.period != null && !isSamePeriodSelection(params.period, periodSelection)
    const compareNeedsFix = !isSamePeriodSelection(params.compare, comparisonPeriodSelection)

    if (!periodNeedsFix && !compareNeedsFix) {
      return
    }

    void setParams(
      {
        period: params.period === null ? null : periodSelection,
        compare: comparisonPeriodSelection,
      },
      { history: "replace" }
    )
  }, [periodSelection, comparisonPeriodSelection, params.period, params.compare, setParams])

  return {
    params,
    setParams,
    setPeriod,
    periodSelection,
    comparisonPeriodSelection,
    selectedRows,
    comparisonRows,
  }
}
