import { schemas } from "@dotkomonline/grades-db/schemas"
import { buildSearchFilter, createSortOrder } from "@dotkomonline/types"
import z from "zod"

export const CourseSchema = schemas.CourseSchema.extend({})

export type CourseId = Course["id"]
export type CourseCode = Course["code"]
export type Course = z.infer<typeof CourseSchema>

export type CourseFilterQuery = z.infer<typeof CourseFilterQuerySchema>
export const CourseFilterQuerySchema = z
	.object({
		byCode: buildSearchFilter(),
		byName: buildSearchFilter(),
		orderBy: createSortOrder(),
		sortByAverageGrade: z.boolean(),
		sortByPassRate: z.boolean(),
		sortByStudentCount: z.boolean()
	})
	.partial()
