import type { GradeDistribution } from "@dotkomonline/grades-backend/grade-distribution"
import { useQueryStates } from "nuqs"
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
  const comparisonPeriodSelection = resolvePeriodSelection(params.vs, gradeDistributions)

  const selectedRows = getGradeDistributionsForSelection(periodSelection, gradeDistributions)
  const comparisonRows = getGradeDistributionsForSelection(comparisonPeriodSelection, gradeDistributions)

  const setPeriod = (period: PeriodSelection) => {
    // If the new period is the same as the comparison period, update the comparison period to a fallback
    const nextVs = isSamePeriodSelection(period, comparisonPeriodSelection)
      ? getFallbackComparisonPeriodSelection(period)
      : params.vs

    setParams({ period, vs: nextVs })
  }

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
