import { schemas } from "@dotkomonline/grades-db/schemas"
import type z from "zod"

export const CourseSchema = schemas.CourseSchema.extend({})

export type CourseId = Course["id"]
export type Course = z.infer<typeof CourseSchema>
