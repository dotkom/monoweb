import type { GradeType, SemesterKey } from "@dotkomonline/grades-backend/course"
import {
  calculateCourseStatistics,
  getGradeDistributionCandidateCount,
  getLetterGradeCandidateCount,
  type GradeDistribution,
} from "@dotkomonline/grades-backend/grade-distribution"

export type SemesterExtreme = { value: number; semester: SemesterKey }

function getSemesterMetric(gradeDistribution: GradeDistribution, mode: GradeType): number | null {
  if (mode === "LETTER") {
    if (getLetterGradeCandidateCount(gradeDistribution) === 0) {
      return null
    }

    return calculateCourseStatistics([gradeDistribution]).averageGrade
  }

  if (getGradeDistributionCandidateCount(gradeDistribution) === 0) {
    return null
  }

  return calculateCourseStatistics([gradeDistribution]).passRate
}

export function getCourseSemesterExtremes(
  gradeDistributions: GradeDistribution[],
  mode: GradeType
): { min: SemesterExtreme; max: SemesterExtreme } | null {
  const values = gradeDistributions
    .map((gradeDistribution) => ({
      value: getSemesterMetric(gradeDistribution, mode),
      semester: { year: gradeDistribution.year, semester: gradeDistribution.semester },
    }))
    .filter((value): value is SemesterExtreme => value.value !== null)

  if (values.length === 0) {
    return null
  }

  return {
    min: values.reduce((min, current) => (current.value < min.value ? current : min), values[0]),
    max: values.reduce((max, current) => (current.value > max.value ? current : max), values[0]),
  }
}
