import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"
import type { User } from "../user/user"
import { getMembershipGrade } from "../user/membership"

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
  if (pool.yearCriteria.length > 0) {
    if (user.membership === null) {
      return false
    }

    const grade = getMembershipGrade(user.membership)

    if (grade === null) {
      return false
    }

    return pool.yearCriteria.includes(grade)
  }

  return true
}
