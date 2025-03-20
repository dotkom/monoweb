import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"
import type { User } from "../user"

export const YearCriteriaSchema = z.array(z.number())

export type YearCriteria = z.infer<typeof YearCriteriaSchema>

export const AttendancePoolSchema = schemas.AttendancePoolSchema.extend({
  yearCriteria: YearCriteriaSchema,
  capacityUsed: z.number(),
})

export const AttendancePoolDetailsSchema = AttendancePoolSchema.extend({
  waitlisted: z.number(),
})

export const AttendancePoolWriteSchema = AttendancePoolSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  capacityUsed: true,
})

export type AttendancePool = z.infer<typeof AttendancePoolSchema>
export type AttendancePoolDetails = z.infer<typeof AttendancePoolDetailsSchema>
export type AttendancePoolWrite = z.infer<typeof AttendancePoolWriteSchema>
export type AttendancePoolId = AttendancePool["id"]

export function canUserRegisterForPool(pool: AttendancePool, user: User) {
  // TODO: Replace with actual year
  return pool.yearCriteria.includes(1)
}
