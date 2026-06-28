import z from "zod"
import { SemesterSchema } from "../course/course-types"

export const GradeSchema = z.object({
  id: z.string(),
  gradeACount: z.number().int(),
  gradeBCount: z.number().int(),
  gradeCCount: z.number().int(),
  gradeDCount: z.number().int(),
  gradeECount: z.number().int(),
  gradeFCount: z.number().int(),
  passedCount: z.number().int(),
  failedCount: z.number().int(),
  courseId: z.string(),
  semester: SemesterSchema,
  year: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type GradeId = Grade["id"]
export type Grade = z.infer<typeof GradeSchema>

export const GradeWriteSchema = GradeSchema.pick({
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
export type GradeWrite = z.infer<typeof GradeWriteSchema>
