import type { TZDate } from "@date-fns/tz"
import { schemas } from "@dotkomonline/db/schemas"
import { getCurrentUtc, slugify } from "@dotkomonline/utils"
import { differenceInYears, isAfter, setMonth, startOfMonth } from "date-fns"
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
export const PHONE_REGEX = /^[0-9+-\s]*$/
export const PROFILE_SLUG_REGEX = /^[a-z0-9-]+$/

// These max and min values are arbitrary
export const UserWriteSchema = z.object({
  profileSlug: z
    .string()
    .min(3, "Brukernavnet må være minst 3 tegn lang")
    .max(32, "Brukernavnet kan ikke være lengre enn 32 tegn")
    .regex(PROFILE_SLUG_REGEX, "Brukernavnet kan bare inneholde små bokstaver, tall og bindestrek")
    // This would make it impossible to enter their profile
    .refine((value) => value !== "rediger", {
      message: 'Brukernavnet kan ikke være "rediger"',
    })
    .refine((value) => slugify(value) === value, {
      message: "Brukernavnet kan bare inneholde små bokstaver, tall og bindestrek",
    }),
  name: z
    .string()
    .min(3, "Du må skrive inn et navn")
    .max(64, "Navnet kan ikke være lengre enn 64 tegn")
    .regex(NAME_REGEX, "Du kan bare bruke bokstaver, bindestrek, apostrof og mellomrom i navnet")
    .nullable(),
  email: z
    .string()
    .email("Ugyldig e-post")
    .min(1, "Du må skrive en e-post")
    .max(128, "E-posten kan ikke være lengre enn 128 tegn")
    .nullable(),
  phone: z.string().regex(PHONE_REGEX, "Ugyldig telefonnummer").nullable(),
  imageUrl: z.string().url("Ugyldig URL").nullable(),
  biography: z.string().nullable(),
  gender: z.string().nullable(),
  dietaryRestrictions: z.string().nullable(),
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
