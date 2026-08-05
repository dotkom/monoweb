import z from "zod"
import { SemesterSchema } from "../course/course-types"

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

export const GradeDistributionWriteSchema = GradeDistributionSchema.pick({
  courseId: true,
  year: true,
  semester: true,
  gradeACount: true,
  gradeBCount: true,
  gradeCCount: true,
  gradeDCount: true,
  gradeECount: true,
  gradeFCount: true,
  failedCount: true,
  passedCount: true,
})
export type GradeDistributionWrite = z.infer<typeof GradeDistributionWriteSchema>
