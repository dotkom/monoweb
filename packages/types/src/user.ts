import type { TZDate } from "@date-fns/tz"
import { schemas } from "@dotkomonline/db/schemas"
import { getCurrentUTC, slugify } from "@dotkomonline/utils"
import { addYears, isAfter, isBefore, setMonth, startOfMonth } from "date-fns"
import { z } from "zod"
import { buildSearchFilter } from "./filters"

export const MembershipSpecializationSchema = schemas.MembershipSpecializationSchema
export type MembershipSpecialization = z.infer<typeof MembershipSpecializationSchema>

export type MembershipType = z.infer<typeof MembershipTypeSchema>
export const MembershipTypeSchema = schemas.MembershipTypeSchema

export const MembershipSchema = schemas.MembershipSchema.extend({})
export type MembershipId = Membership["id"]
export type Membership = z.infer<typeof MembershipSchema>

export const MembershipWriteSchema = MembershipSchema.pick({
  type: true,
  start: true,
  end: true,
  specialization: true,
})
export type MembershipWrite = z.infer<typeof MembershipWriteSchema>

export const UserSchema = schemas.UserSchema.extend({
  memberships: z.array(MembershipSchema),
})
export type User = z.infer<typeof UserSchema>
export type UserId = User["id"]
export type UserProfileSlug = User["profileSlug"]

export const NAME_REGEX = /^[\p{L}\p{M}\s'-]+$/u
export const PHONE_REGEX = /^[0-9-+\s]*$/
export const PROFILE_SLUG_REGEX = /^[a-z0-9-]+$/

// These max and min values are arbitrary
export const UserWriteSchema = UserSchema.pick({
  workspaceUserId: true,
}).extend({
  profileSlug: z
    .string()
    .min(2, "Brukernavnet må være minst 2 tegn lang")
    .max(64, "Brukernavnet kan ikke være lengre enn 64 tegn")
    .regex(PROFILE_SLUG_REGEX, "Brukernavnet kan bare inneholde små bokstaver, tall og bindestrek")
    .refine((value) => slugify(value) === value, {
      message: "Brukernavnet kan bare inneholde små bokstaver, tall og bindestrek",
    }),
  name: z
    .string()
    .min(2, "Du må skrive inn et navn")
    .max(128, "Navnet kan ikke være lengre enn 128 tegn")
    .regex(NAME_REGEX, "Du kan bare bruke bokstaver, bindestrek, apostrof og mellomrom i navnet")
    .nullable(),
  email: z
    .string()
    .email("Ugyldig e-post")
    .min(1, "Du må skrive en e-post")
    .max(128, "E-posten kan ikke være lengre enn 128 tegn")
    .nullable(),
  phone: z
    .string()
    .regex(PHONE_REGEX, "Ugyldig telefonnummer")
    .max(32, "Telefonnummeret kan ikke være lengre enn 32 tegn")
    .nullable(),
  imageUrl: z.string().url("Ugyldig URL").max(500, "Bildelenken kan ikke være lengre enn 500 tegn").nullable(),
  biography: z.string().max(2000, "Biografien kan ikke være lengre enn 2000 tegn").nullable(),
  gender: z.string().nullable(),
  dietaryRestrictions: z.string().max(200, "Kostholdsrestriksjoner kan ikke være lengre enn 200 tegn").nullable(),
})
export type UserWrite = z.infer<typeof UserWriteSchema>

export const PublicUserSchema = UserSchema.pick({
  id: true,
  profileSlug: true,
  name: true,
  imageUrl: true,
  biography: true,
})

export const UserFilterQuerySchema = z
  .object({
    byName: buildSearchFilter(),
    byEmail: buildSearchFilter(),
  })
  .partial()
export type UserFilterQuery = z.infer<typeof UserFilterQuerySchema>

/** Get the most relevant active membership for a user. */
export function findActiveMembership(user: User): Membership | null {
  const now = getCurrentUTC()
  return user.memberships.findLast((membership) => isAfter(membership.end, now)) ?? null
}

export function getMembershipGrade(membership: Membership): 1 | 2 | 3 | 4 | 5 | null {
  const now = getCurrentUTC()

  // Make sure we clamp the value to a minimum of 1
  const delta = Math.max(1, getAcademicYearDelta(membership.start, now))

  switch (membership.type) {
    case "KNIGHT":
    case "PHD_STUDENT":
      return 5

    case "SOCIAL_MEMBER":
      return 1

    case "BACHELOR_STUDENT": {
      // Bachelor students are clamped at 1-3, regardless of how many years they used to take the degree.
      return Math.min(3, delta) as 1 | 2 | 3
    }

    case "MASTER_STUDENT": {
      // Master students are clamped at 4-5, and are always considered to have a bachelor's degree from beforehand.
      const yearsWithBachelors = delta + 3
      return Math.min(5, yearsWithBachelors) as 4 | 5
    }

    case "OTHER":
      return null
  }
}

export function getMembershipTypeName(type: MembershipType) {
  switch (type) {
    case "BACHELOR_STUDENT":
      return "Bachelor"
    case "MASTER_STUDENT":
      return "Master"
    case "SOCIAL_MEMBER":
      return "Sosialt medlem"
    case "KNIGHT":
      return "Ridder"
    case "PHD_STUDENT":
      return "PhD-student"
    case "OTHER":
      return "Annen"
  }
}

export function getSpecializationName(specialization: MembershipSpecialization) {
  switch (specialization) {
    case "ARTIFICIAL_INTELLIGENCE":
      return "Kunstig intelligens"
    case "DATABASE_AND_SEARCH":
      return "Database og søk"
    case "INTERACTION_DESIGN":
      return "Interaksjonsdesign"
    case "SOFTWARE_ENGINEERING":
      return "Programvareutvikling"
    case "UNKNOWN":
      return "Ukjent spesialisering"
  }
}

/** Get the start of the academic year, which is by our convention August 1st. */
export function getAcademicStart(date: TZDate | Date): TZDate {
  // August is the 8th month, so we set the month to 7 (0-indexed)
  return startOfMonth(setMonth(date, 7))
}

export function getNextAcademicStart(): TZDate {
  const now = getCurrentUTC()
  const firstAugust = getAcademicStart(getCurrentUTC())
  const isBeforeAugust = isBefore(now, firstAugust)
  return isBeforeAugust ? firstAugust : addYears(firstAugust, 1)
}

/**
 * Calculates how many academic years have passed since the start date.
 * If start is "last August" (current academic year), returns 1.
 * If start was the August before that, returns 2.
 */
function getAcademicYearDelta(startDate: Date | TZDate, now: Date | TZDate = getCurrentUTC()): number {
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-indexed (Jan=0, Aug=7)

  // If we are in Jan-July (0-6), the academic year started in the PREVIOUS calendar year
  // If we are in Aug-Dec (7-11), the academic year started in THIS calendar year
  const academicYearCurrent = currentMonth >= 7 ? currentYear : currentYear - 1

  // We do the same normalization for the membership start date
  // (Handling cases where a member might join in Jan/Feb)
  const startYear = startDate.getFullYear()
  const startMonth = startDate.getMonth()
  const academicYearStart = startMonth >= 7 ? startYear : startYear - 1

  return academicYearCurrent - academicYearStart + 1
}

export const USER_IMAGE_MAX_SIZE_KIB = 512
