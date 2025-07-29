import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"
import { type User, getActiveMembership, getMembershipGrade } from "../user"

export const YearCriteriaSchema = z.array(z.number())

export type YearCriteria = z.infer<typeof YearCriteriaSchema>

export type AttendancePoolId = AttendancePool["id"]
export type AttendancePool = z.infer<typeof AttendancePoolSchema>
export const AttendancePoolSchema = schemas.AttendancePoolSchema.extend({
  numAttendees: z.number(),
  numUnreservedAttendees: z.number(),
  yearCriteria: YearCriteriaSchema,
})

export type AttendancePoolWrite = z.infer<typeof AttendancePoolWriteSchema>
export const AttendancePoolWriteSchema = AttendancePoolSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  numAttendees: true,
  numUnreservedAttendees: true,
})

export function canUserAttendPool(pool: AttendancePool, user: User) {
  if (user.memberships.length === 0) {
    return false
  }

  if (pool.yearCriteria.length === 0) {
    return true
  }

  const activeMembership = getActiveMembership(user)
  if (activeMembership === null) {
    return false
  }
  const grade = getMembershipGrade(activeMembership)
  if (grade === null) {
    return false
  }

  return pool.yearCriteria.includes(grade)
}
