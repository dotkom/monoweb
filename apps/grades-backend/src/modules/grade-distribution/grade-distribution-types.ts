import z from "zod"
import { SemesterSchema, type GradeType } from "../course/course-types"

export const GradeDistributionSchema = z.object({
  id: z.string(),
  gradeACount: z.int(),
  gradeBCount: z.int(),
  gradeCCount: z.int(),
  gradeDCount: z.int(),
  gradeECount: z.int(),
  gradeFCount: z.int(),
  passedCount: z.int(),
  failedCount: z.int(),
  courseId: z.string(),
  semester: SemesterSchema,
  year: z.int(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type GradeDistributionId = GradeDistribution["id"]
export type GradeDistribution = z.infer<typeof GradeDistributionSchema>

export const GradeDistributionCountFieldsSchema = GradeDistributionSchema.pick({
  gradeACount: true,
  gradeBCount: true,
  gradeCCount: true,
  gradeDCount: true,
  gradeECount: true,
  gradeFCount: true,
  passedCount: true,
  failedCount: true,
})
export type GradeDistributionCountFields = z.infer<typeof GradeDistributionCountFieldsSchema>

export const GradeDistributionWriteSchema = GradeDistributionCountFieldsSchema.extend({
  courseId: z.string(),
  year: z.int(),
  semester: SemesterSchema,
})
export type GradeDistributionWrite = z.infer<typeof GradeDistributionWriteSchema>

export const gradeDistributionCountFieldKeys = Object.keys(
  GradeDistributionCountFieldsSchema.shape
) as (keyof GradeDistributionCountFields)[]

export const letterGradeCountFieldKeys = gradeDistributionCountFieldKeys.filter((field) => field.startsWith("grade"))

export const passFailCountFieldKeys = gradeDistributionCountFieldKeys.filter(
  (field) => field === "passedCount" || field === "failedCount"
)

export function emptyGradeDistributionCounts(): GradeDistributionCountFields {
  return GradeDistributionCountFieldsSchema.parse(
    Object.fromEntries(gradeDistributionCountFieldKeys.map((field) => [field, 0]))
  )
}

export function sumGradeCountFields(
  grades: GradeDistributionCountFields,
  fields: readonly (keyof GradeDistributionCountFields)[]
) {
  return fields.reduce((sum, field) => sum + grades[field], 0)
}

export function getChartCountFields(grades: GradeDistributionCountFields) {
  const letterTotal = getLetterGradeCandidateCount(grades)
  const passFailTotal = grades.passedCount + grades.failedCount

  if (letterTotal > 0 && passFailTotal > 0) {
    return [...letterGradeCountFieldKeys, ...passFailCountFieldKeys]
  }

  if (passFailTotal > 0 && letterTotal === 0) {
    return passFailCountFieldKeys
  }

  return letterGradeCountFieldKeys
}

export function getGradeDistributionCandidateCount(gradeDistribution: GradeDistributionCountFields) {
  return sumGradeCountFields(gradeDistribution, gradeDistributionCountFieldKeys)
}

export function getLetterGradeCandidateCount(gradeDistribution: GradeDistributionCountFields) {
  return sumGradeCountFields(gradeDistribution, letterGradeCountFieldKeys)
}

export function getPassFailCandidateCount(gradeDistribution: GradeDistributionCountFields) {
  return gradeDistribution.passedCount + gradeDistribution.failedCount
}

export function aggregateGradeDistributions(gradeDistributions: GradeDistribution[]): GradeDistributionCountFields {
  return gradeDistributions.reduce((acc, gradeDistribution) => {
    for (const field of gradeDistributionCountFieldKeys) {
      acc[field] += gradeDistribution[field]
    }

    return acc
  }, emptyGradeDistributionCounts())
}

export function getFailedCandidateCount(gradeDistribution: GradeDistributionCountFields) {
  return gradeDistribution.gradeFCount + gradeDistribution.failedCount
}

export function getPreferredGradeType(hasLetterGrades: boolean, hasPassFailGrades: boolean): GradeType {
  // If there are both letter grades and pass/fail grades, we prefer letter grades as they contain more information
  if (hasLetterGrades || !hasPassFailGrades) {
    return "LETTER"
  }

  return "PASS_FAIL"
}

export function calculateCourseGradeType(gradeDistributions: GradeDistribution[]): GradeType {
  const hasLetterGrades = gradeDistributions.some(
    (gradeDistribution) => getLetterGradeCandidateCount(gradeDistribution) > 0
  )
  const hasPassFailGrades = gradeDistributions.some(
    (gradeDistribution) => getPassFailCandidateCount(gradeDistribution) > 0
  )

  return getPreferredGradeType(hasLetterGrades, hasPassFailGrades)
}

export function calculateCourseStatistics(gradeDistributions: GradeDistribution[]): {
  candidateCount: number
  averageGrade: number
  passRate: number
} {
  if (gradeDistributions.length === 0) {
    return { candidateCount: 0, averageGrade: 0, passRate: 0 }
  }

  const candidateCount = gradeDistributions.reduce(
    (sum, gradeDistribution) => sum + getGradeDistributionCandidateCount(gradeDistribution),
    0
  )
  const failedCount = gradeDistributions.reduce(
    (sum, gradeDistribution) => sum + getFailedCandidateCount(gradeDistribution),
    0
  )
  const letterGradeCandidateCount = gradeDistributions.reduce(
    (sum, gradeDistribution) => sum + getLetterGradeCandidateCount(gradeDistribution),
    0
  )

  const averageGradePoints = gradeDistributions.reduce(
    (sum, gradeDistribution) =>
      sum +
      gradeDistribution.gradeACount * 5 +
      gradeDistribution.gradeBCount * 4 +
      gradeDistribution.gradeCCount * 3 +
      gradeDistribution.gradeDCount * 2 +
      gradeDistribution.gradeECount * 1,
    0
  )

  const averageGrade = letterGradeCandidateCount === 0 ? 0 : averageGradePoints / letterGradeCandidateCount
  const passRate = candidateCount === 0 ? 0 : ((candidateCount - failedCount) * 100) / candidateCount

  return { candidateCount, averageGrade, passRate }
}

const semesterOrder = {
  [SemesterSchema.enum.SPRING]: 1,
  [SemesterSchema.enum.SUMMER]: 2,
  [SemesterSchema.enum.AUTUMN]: 3,
}

export const sortGradeDistributionsByYearAndSemester = (gradeDistributions: GradeDistribution[]) => {
  return gradeDistributions.toSorted((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year
    }

    return semesterOrder[b.semester] - semesterOrder[a.semester]
  })
}
