import { TZDate } from "@date-fns/tz"
import { schemas } from "@dotkomonline/db/schemas"
import { getCurrentUTC, slugify } from "@dotkomonline/utils"
import { addYears, isAfter, isBefore, isWithinInterval, subYears } from "date-fns"
import { z } from "zod"
import { buildSearchFilter } from "./filters"
import invariant from "tiny-invariant"

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
  semester: true,
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

export function isMembershipActive(
  membership: Membership | MembershipWrite,
  now: TZDate | Date = getCurrentUTC()
): boolean {
  if (isAfter(membership.start, now)) {
    return false
  }

  if (membership.end && isBefore(membership.end, now)) {
    return false
  }

  return true
}

/**
 * Get the most relevant active membership for a user. Most relevant is defined as the membership with the highest
 * semester.
 *
 * This will always deprioritize KNIGHT (Ridder) memberships in favor of student or social memberships, because they are
 * easier to work with for our attendance systems.
 */
export function findActiveMembership(user: User): Membership | null {
  const now = getCurrentUTC()

  // This orders active memberships by semester descending with null values last
  const orderedMemberships = user.memberships
    .filter((membership) => isMembershipActive(membership, now))
    .toSorted((a, b) => {
      if (a.semester === null && b.semester === null) {
        return 0
      }

      if (a.semester !== null && b.semester !== null) {
        return b.semester - a.semester
      }

      return b.semester !== null ? 1 : -1
    })

  return orderedMemberships.at(0) ?? null
}

export function getGradeFromSemester(semester: number): number {
  return Math.floor(semester / 2) + 1
}

export function getMembershipGrade(membership: Membership): 1 | 2 | 3 | 4 | 5 | null {
  switch (membership.type) {
    case "KNIGHT": {
      return null
    }

    case "BACHELOR_STUDENT": {
      invariant(membership.semester !== null, "Membership semester cannot be null for BACHELOR_STUDENT")
      const grade = getGradeFromSemester(membership.semester)

      return Math.max(1, Math.min(grade, 3)) as 1 | 2 | 3
    }

    case "MASTER_STUDENT":
    case "PHD_STUDENT": {
      invariant(membership.semester !== null, "Membership semester cannot be null for MASTER_STUDENT or PHD_STUDENT")
      const grade = getGradeFromSemester(membership.semester)

      return Math.max(4, Math.min(grade, 5)) as 4 | 5
    }

    case "SOCIAL_MEMBER": {
      invariant(membership.semester !== null, "Membership semester cannot be null for SOCIAL_MEMBER")
      const grade = getGradeFromSemester(membership.semester)

      return Math.max(1, Math.min(grade, 5)) as 1 | 2 | 3 | 4 | 5
    }
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

const JANUARY = 0
const AUGUST = 7

/**
 * Get the start of the academic year, which is by our convention January 1st.
 * `January 1st -- <year>-01-01T00:00:00.000Z`
 */
export const getSpringSemesterStart = (dateOrYear: TZDate | Date | number) => {
  const year = typeof dateOrYear === "number" ? dateOrYear : dateOrYear.getFullYear()

  return new TZDate(year, JANUARY, 1)
}

/**
 * Get the start of the academic year, which is by our convention August 1st.
 * `August 1st -- <year>-08-01T00:00:00.000Z`
 */
export const getAutumnSemesterStart = (dateOrYear: TZDate | Date | number) => {
  const year = typeof dateOrYear === "number" ? dateOrYear : dateOrYear.getFullYear()

  return new TZDate(year, AUGUST, 1)
}

export const isSpringSemester = (date: TZDate | Date = getCurrentUTC()): boolean => {
  return isBefore(date, getAutumnSemesterStart(date.getFullYear()))
}

export const isAutumnSemester = (date: TZDate | Date = getCurrentUTC()): boolean => {
  return !isSpringSemester(date)
}

export function getNextAutumnSemesterStart(): TZDate {
  const now = getCurrentUTC()
  const firstAugust = getAutumnSemesterStart(getCurrentUTC())
  const isBeforeAugust = isBefore(now, firstAugust)

  return isBeforeAugust ? firstAugust : addYears(firstAugust, 1)
}

export function getCurrentSemesterStart(): TZDate {
  const now = getCurrentUTC()
  const year = now.getFullYear()

  const springSemesterStart = getSpringSemesterStart(year)
  const autumnSemesterStart = getAutumnSemesterStart(year)

  if (isWithinInterval(now, { start: springSemesterStart, end: autumnSemesterStart })) {
    return springSemesterStart
  }

  return autumnSemesterStart
}

export function getNextSemesterStart(): TZDate {
  const now = getCurrentUTC()
  const autumnSemesterStart = getAutumnSemesterStart(now.getFullYear())

  if (isBefore(now, autumnSemesterStart)) {
    return autumnSemesterStart
  }

  return getSpringSemesterStart(addYears(now, 1).getFullYear())
}

export function getCourseStart(semester: number): TZDate {
  // We use Math#round because it will give us the correct year delta:
  //   Year 1 autumn (value 0)  : round(0 / 2) = 0 (Start year = current year)
  //   Year 1 spring (value 1): round(1 / 2) = 1 (Start year = current - 1, since spring is in the next calendar year)
  //   Year 2 autumn (value 2)  : round(2 / 2) = 1 (Start year = current - 1)
  //   Year 2 spring (value 3): round(3 / 2) = 2 (Start year = current - 2)
  //   ...
  const yearOffset = Math.round(semester / 2)
  return subYears(getAutumnSemesterStart(getCurrentUTC()), yearOffset)
}

export function getStudyGrade(semester: number): number {
  // A school year consists of two semesters (Autumn and Spring). So this formula will give us the year:
  //   Year 1 autumn (value 0): floor(0 / 2) + 1 = 1 (Year 1)
  //   Year 1 spring (value 1): floor(1 / 2) + 1 = 1 (Year 1)
  //   Year 2 autumn (value 2): floor(2 / 2) + 1 = 2 (Year 2)
  //   Year 2 spring (value 3): floor(3 / 2) + 1 = 2 (Year 2)
  //   Year 3 autumn (value 4): floor(4 / 2) + 1 = 3 (Year 3)
  //   ...
  return Math.floor(semester / 2) + 1
}
