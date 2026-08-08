import type { Semester } from "@dotkomonline/grades-backend/course"
import {
  aggregateGradeDistributions,
  calculateCourseStatistics,
  getLetterGradeCandidateCount,
  getPassFailCandidateCount,
  sortGradeDistributionsByYearAndSemester,
  type GradeDistribution,
  type GradeDistributionCountFields,
} from "@dotkomonline/grades-backend/grade-distribution"
import type { PeriodPreset, PeriodSelection } from "./course-page-params"

const CHART_FIELD_LABELS: Record<keyof GradeDistributionCountFields, string> = {
  gradeACount: "A",
  gradeBCount: "B",
  gradeCCount: "C",
  gradeDCount: "D",
  gradeECount: "E",
  gradeFCount: "F",
  passedCount: "PASS",
  failedCount: "FAIL",
}

export function chartFieldLabel(field: keyof GradeDistributionCountFields): string {
  return CHART_FIELD_LABELS[field]
}

export type AggregatedGradeDistribution = {
  candidateCount: number
  averageGrade: number | null
  passRate: number
  grades: GradeDistributionCountFields
}

export function getGradeDistributionsForSelection(
  selection: PeriodSelection | null,
  gradeDistributions: GradeDistribution[]
): GradeDistribution[] {
  const sortedNewestFirst = sortGradeDistributionsByYearAndSemester(gradeDistributions)

  // If nothing is selected, default to the most recent semester
  if (!selection) {
    const latest = sortedNewestFirst.at(0)
    return latest ? [latest] : []
  }

  if (selection.kind === "preset") {
    switch (selection.preset) {
      case "ALL_YEARS":
        return sortedNewestFirst

      // Anchored at the latest year and includes full years
      case "LAST_THREE_YEARS": {
        const latestYear = sortedNewestFirst[0]?.year ?? 0
        return sortedNewestFirst.filter((gd) => gd.year >= latestYear - 2)
      }
    }
  }

  return sortedNewestFirst.filter(
    (gd) =>
      selection.semester !== null && selection.semester.year === gd.year && selection.semester.semester === gd.semester
  )
}

export function toAggregatedGradeDistribution(gradeDistributions: GradeDistribution[]): AggregatedGradeDistribution {
  const grades = aggregateGradeDistributions(gradeDistributions)
  const { averageGrade, candidateCount, passRate } = calculateCourseStatistics(gradeDistributions)
  const letterCount = getLetterGradeCandidateCount(grades)

  return {
    candidateCount,
    averageGrade: letterCount === 0 ? null : averageGrade,
    passRate,
    grades,
  }
}

export function sameSemesters(
  a: Array<{ year: number; semester: Semester }>,
  b: Array<{ year: number; semester: Semester }>
) {
  if (a.length !== b.length) {
    return false
  }

  return a.every((semester) => b.some((other) => other.year === semester.year && other.semester === semester.semester))
}

export function resolvePeriodSelection(
  selection: PeriodSelection | null,
  gradeDistributions: GradeDistribution[]
): PeriodSelection {
  const latest = sortGradeDistributionsByYearAndSemester(gradeDistributions).at(0)
  const defaultSemester = latest ? { year: latest.year, semester: latest.semester } : null

  if (!selection) {
    return {
      kind: "semester",
      semester: defaultSemester,
    }
  }

  if (selection.kind === "semester" && selection.semester === null) {
    return {
      kind: "semester",
      semester: defaultSemester,
    }
  }

  const selectionExists =
    selection.kind === "semester" &&
    gradeDistributions.some(
      (gd) => gd.year === selection.semester?.year && gd.semester === selection.semester?.semester
    )

  if (selection.kind === "semester" && !selectionExists) {
    return {
      kind: "semester",
      semester: defaultSemester,
    }
  }

  return selection
}

export function isSamePeriodSelection(a: PeriodSelection, b: PeriodSelection) {
  if (a.kind === "preset" && b.kind === "preset") {
    return a.preset === b.preset
  }

  if (a.kind === "semester" && b.kind === "semester") {
    return a.semester?.year === b.semester?.year && a.semester?.semester === b.semester?.semester
  }

  return false
}

// If a primary period conflicts with a comparison period, return a fallback for the comparison period
// LAST_THREE_YEARS is the primary fallback, ALL_YEARS is the secondary fallback
export function getFallbackComparisonPeriodSelection(primary: PeriodSelection): PeriodSelection {
  const mainFallback: PeriodPreset = "LAST_THREE_YEARS"
  const secondaryFallback: PeriodPreset = "ALL_YEARS"

  if (primary.kind === "semester") {
    return {
      kind: "preset",
      preset: mainFallback,
    }
  }

  if (primary.preset === "ALL_YEARS") {
    return {
      kind: "preset",
      preset: mainFallback,
    }
  }

  return {
    kind: "preset",
    preset: secondaryFallback,
  }
}

export type PeriodCompareFlags = {
  showLetterKpi: boolean
  showLetterDelta: boolean
  canGhostCompare: boolean
}

export function getPeriodCompareFlags(
  selectedRows: GradeDistributionCountFields[],
  comparisonRows: GradeDistributionCountFields[]
): PeriodCompareFlags {
  const selectedHasLetterGrades = selectedRows.some((row) => getLetterGradeCandidateCount(row) > 0)
  const comparisonHasLetterGrades = comparisonRows.some((row) => getLetterGradeCandidateCount(row) > 0)
  const comparisonHasPassFailGrades = comparisonRows.some((row) => getPassFailCandidateCount(row) > 0)

  return {
    showLetterKpi: selectedHasLetterGrades,
    showLetterDelta: selectedHasLetterGrades && comparisonHasLetterGrades,
    canGhostCompare: !selectedHasLetterGrades || comparisonHasLetterGrades || comparisonHasPassFailGrades,
  }
}
