import type { TZDate } from "@date-fns/tz"
import { schemas } from "@dotkomonline/db/schemas"
import { getCurrentUtc } from "@dotkomonline/utils"
import { differenceInYears, isAfter, setMonth, startOfMonth } from "date-fns"
import { z } from "zod"
import { buildSearchFilter } from "./filters"

export type MembershipSpecialization = z.infer<typeof MembershipSpecializationSchema>
export const MembershipSpecializationSchema = schemas.MembershipSpecializationSchema

export type MembershipId = Membership["id"]
export type Membership = z.infer<typeof MembershipSchema>
export const MembershipSchema = schemas.MembershipSchema.extend({})

export type MembershipWrite = z.infer<typeof MembershipWriteSchema>
export const MembershipWriteSchema = MembershipSchema.pick({
  type: true,
  start: true,
  end: true,
  specialization: true,
})

export type UserId = User["id"]
export type UserProfileSlug = User["profileSlug"]
export type User = z.infer<typeof UserSchema>
export const UserSchema = schemas.UserSchema.extend({
  memberships: z.array(MembershipSchema),
})

export type UserWrite = z.infer<typeof UserWriteSchema>
export const UserWriteSchema = UserSchema.pick({
  profileSlug: true,
  name: true,
  email: true,
  imageUrl: true,
  biography: true,
  phone: true,
  gender: true,
  dietaryRestrictions: true,
})

export type UserFilterQuery = z.infer<typeof UserFilterQuerySchema>
export const UserFilterQuerySchema = z.object({
  byName: buildSearchFilter(),
})

/** Get the most relevant active membership for a user. */
export function getActiveMembership(user: User): Membership | null {
  const now = getCurrentUtc()
  return user.memberships.findLast((membership) => isAfter(membership.end, now)) ?? null
}

export function getMembershipGrade(membership: Membership): number | null {
  switch (membership.type) {
    case "KNIGHT":
      return null
    case "PHD_STUDENT":
      return 6
    case "SOCIAL_MEMBER":
      return 1
    case "BACHELOR_STUDENT":
    case "MASTER_STUDENT": {
      // Take the difference, and add one because if `startYear == currentYear` they are in their first year
      return differenceInYears(getAcademicStart(getCurrentUtc()), getAcademicStart(membership.start)) + 1
    }
  }
}

/** Get the start of the academic year, which is by our convention August 1st. */
export function getAcademicStart(date: TZDate | Date): TZDate {
  // August is the 8th month, so we set the month to 7 (0-indexed)
  return startOfMonth(setMonth(date, 7))
}
