import z from "zod"
import { GradeDistributionSchema } from "../grade-distribution/grade-distribution-types"
import { CourseAliasSchema, CourseSchema, DepartmentSchema, FacultySchema } from "./course-types"

export const CourseDetailSchema = CourseSchema.extend({
  aliases: z.array(CourseAliasSchema),
  faculty: FacultySchema.nullable(),
  department: DepartmentSchema.nullable(),
  gradeDistributions: z.array(GradeDistributionSchema),
})
export type CourseDetail = z.infer<typeof CourseDetailSchema>
