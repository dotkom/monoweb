import { schemas } from "@dotkomonline/db"
import { z } from "zod"
import type { User } from "../user"

export const YearCriteriaSchema = z.array(z.number())

export type YearCriteria = z.infer<typeof YearCriteriaSchema>

export const AttendancePoolSchema = schemas.AttendancePoolSchema.extend({
  numAttendees: z.number(),
  yearCriteria: YearCriteriaSchema,
})

export const AttendancePoolWriteSchema = AttendancePoolSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  numAttendees: true,
})

export type AttendancePool = z.infer<typeof AttendancePoolSchema>
export type AttendancePoolWrite = z.infer<typeof AttendancePoolWriteSchema>
export type AttendancePoolId = AttendancePool["id"]

export const AttendancePoolWithoutAttendeeCount = AttendancePoolSchema.omit({
  numAttendees: true,
})

export type AttendancePoolWithoutAttendeeCount = z.infer<typeof AttendancePoolWithoutAttendeeCount>

export function canUserAttendPool(pool: AttendancePool, user: User) {
  // TODO: Replace with actual year
  return pool.yearCriteria.includes(1)
}
