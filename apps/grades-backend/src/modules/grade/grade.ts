import { schemas } from "@dotkomonline/grades-db/schemas"
import type z from "zod"

export const GradeSchema = schemas.GradeSchema.extend({})

export type GradeId = Grade["id"]
export type Grade = z.infer<typeof GradeSchema>
