import { schemas } from "@dotkomonline/grades-db/schemas"
import type z from "zod"

export const GradeSchema = schemas.GradeSchema.extend({})

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
