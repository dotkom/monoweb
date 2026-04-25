import type { TZDate } from "@date-fns/tz"
import { buildSearchFilter, getCurrentUTC, slugify } from "@dotkomonline/utils"
import type { GetUsers200ResponseOneOfInnerIdentitiesInner, ManagementClient } from "auth0"
import { isAfter, isBefore } from "date-fns"
import { z } from "zod"

export const MembershipSpecializationSchema = z.enum([
  "ARTIFICIAL_INTELLIGENCE",
  "DATABASE_AND_SEARCH",
  "INTERACTION_DESIGN",
  "SOFTWARE_ENGINEERING",
  "UNKNOWN",
])
export type MembershipSpecialization = z.infer<typeof MembershipSpecializationSchema>

export const MembershipTypeSchema = z.enum(["BACHELOR_STUDENT", "MASTER_STUDENT", "KNIGHT", "SOCIAL_MEMBER"])
export type MembershipType = z.infer<typeof MembershipTypeSchema>

export const MembershipSchema = z.object({
  id: z.string(),
  type: MembershipTypeSchema,
  specialization: MembershipSpecializationSchema.default("UNKNOWN").nullable(),
  start: z.date(),
  end: z.date().nullable(),
  semester: z.number().int().nullable(),
  userId: z.string(),
})
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

export const GenderSchema = z.enum(["MALE", "FEMALE", "NON_BINARY", "OTHER", "UNKNOWN"])
export type Gender = z.infer<typeof GenderSchema>

export const UserFlagSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
})
export type UserFlag = z.infer<typeof UserFlagSchema>
export type UserFlagId = UserFlag["id"]

export const UserFlagWriteSchema = UserFlagSchema.pick({
  name: true,
  description: true,
  imageUrl: true,
})
export type UserFlagWrite = z.infer<typeof UserFlagWriteSchema>

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  imageUrl: z.string().nullable(),
  biography: z.string().nullable(),
  phone: z.string().nullable(),
  gender: GenderSchema.default("UNKNOWN"),
  dietaryRestrictions: z.string().nullable(),
  ntnuUsername: z.string().nullable(),
  flags: z.array(UserFlagSchema),
  workspaceUserId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  privacyPermissionsId: z.string().nullable(),
  notificationPermissionsId: z.string().nullable(),
  memberships: z.array(MembershipSchema),
})
export type User = z.infer<typeof UserSchema>
export type UserId = User["id"]
export type Username = User["username"]

export function normalizeDbUser(user: { userFlagLinks: { userFlag: UserFlag }[]; [key: string]: unknown }) {
  const { userFlagLinks, ...rest } = user

  return {
    ...rest,
    flags: userFlagLinks.map((l) => l.userFlag),
  }
}

export const UserFlagWithUsersSchema = UserFlagSchema.extend({
  users: UserSchema.pick({
    id: true,
    name: true,
    username: true,
    imageUrl: true,
  }).array(),
})
export type UserFlagWithUsers = z.infer<typeof UserFlagWithUsersSchema>

export const NAME_REGEX = /^[\p{L}\p{M}\s'-]+$/u
export const PHONE_REGEX = /^[0-9-+\s]*$/
export const PROFILE_SLUG_REGEX = /^[a-z0-9-]+$/

// These max and min values are arbitrary
export const UserWriteSchema = UserSchema.pick({
  workspaceUserId: true,
  gender: true,
}).extend({
  username: z
    .string()
    .min(2, "Brukernavnet må være minst 2 tegn lang")
    .max(64, "Brukernavnet kan ikke være lengre enn 64 tegn")
    .regex(PROFILE_SLUG_REGEX, "Brukernavnet kan bare inneholde små bokstaver, tall og bindestrek")
    .refine((value) => slugify(value) === value, {
      error: "Brukernavnet kan bare inneholde små bokstaver, tall og bindestrek",
    }),
  name: z
    .string()
    .min(2, "Du må skrive inn et navn")
    .max(128, "Navnet kan ikke være lengre enn 128 tegn")
    .regex(NAME_REGEX, "Du kan bare bruke bokstaver, bindestrek, apostrof og mellomrom i navnet")
    .nullable(),
  email: z
    .email("Ugyldig e-post")
    .min(1, "Du må skrive en e-post")
    .max(128, "E-posten kan ikke være lengre enn 128 tegn")
    .nullable(),
  phone: z
    .string()
    .regex(PHONE_REGEX, "Ugyldig telefonnummer")
    .max(32, "Telefonnummeret kan ikke være lengre enn 32 tegn")
    .nullable(),
  imageUrl: z.url("Ugyldig URL").max(500, "Bildelenken kan ikke være lengre enn 500 tegn").nullable(),
  biography: z.string().max(2000, "Biografien kan ikke være lengre enn 2000 tegn").nullable(),
  dietaryRestrictions: z.string().max(200, "Kostholdsrestriksjoner kan ikke være lengre enn 200 tegn").nullable(),
})
export type UserWrite = z.infer<typeof UserWriteSchema>

export const PublicUserSchema = UserSchema.pick({
  id: true,
  username: true,
  name: true,
  imageUrl: true,
  biography: true,
})
export type PublicUser = z.infer<typeof PublicUserSchema>

export const UserFilterQuerySchema = z
  .object({
    byName: buildSearchFilter(),
    byEmail: buildSearchFilter(),
  })
  .partial()
export type UserFilterQuery = z.infer<typeof UserFilterQuerySchema>

export const FlagName = {
  VANITY_VERIFIED: "VANITY_VERIFIED",
  EXCEPTIONALLY_DISTINGUISHED: "EXCEPTIONALLY_DISTINGUISHED",
} as const

export type FlagName = (typeof FlagName)[keyof typeof FlagName]

export function getFlagLabel(name: FlagName) {
  switch (name) {
    case FlagName.VANITY_VERIFIED:
      return "OW Verified"
    case FlagName.EXCEPTIONALLY_DISTINGUISHED:
      return "Særskilt utmerket"
  }
}

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

export function getGenderName(gender: Gender) {
  switch (gender) {
    case "MALE":
      return "Mann"
    case "FEMALE":
      return "Kvinne"
    case "NON_BINARY":
      return "Ikke-binær"
    case "OTHER":
      return "Annet"
    case "UNKNOWN":
      return "Ikke oppgitt"
  }
}

export const USER_IMAGE_MAX_SIZE_KIB = 512

export const PrivacyPermissionsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  profileVisible: z.boolean().default(true),
  usernameVisible: z.boolean().default(true),
  emailVisible: z.boolean(),
  phoneVisible: z.boolean(),
  addressVisible: z.boolean(),
  attendanceVisible: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type PrivacyPermissions = z.infer<typeof PrivacyPermissionsSchema>

export const PrivacyPermissionsWriteSchema = PrivacyPermissionsSchema.omit({
  createdAt: true,
  updatedAt: true,
  userId: true,
})
export type PrivacyPermissionsWrite = z.infer<typeof PrivacyPermissionsWriteSchema>

export const NotificationPermissionsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  applications: z.boolean().default(true),
  newArticles: z.boolean().default(true),
  standardNotifications: z.boolean().default(true),
  groupMessages: z.boolean().default(true),
  markRulesUpdates: z.boolean().default(true),
  receipts: z.boolean().default(true),
  registrationByAdministrator: z.boolean().default(true),
  registrationStart: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type NotificationPermissions = z.infer<typeof NotificationPermissionsSchema>

export const NotificationPermissionsWriteSchema = NotificationPermissionsSchema.omit({
  createdAt: true,
  updatedAt: true,
  userId: true,
})
export type NotificationPermissionsWrite = z.infer<typeof NotificationPermissionsWriteSchema>

export const Auth0ConnectionSchema = z.object({
  identities: z.array(z.custom<GetUsers200ResponseOneOfInnerIdentitiesInner>()),
  hasFeide: z.boolean(),
  hasUsernamePassword: z.boolean(),
})

export type Auth0Connection = z.infer<typeof Auth0ConnectionSchema>

export type Auth0UserProfile = Awaited<ReturnType<ManagementClient["users"]["get"]>>["data"]

export const Auth0UserProfileUserMetadataSchema = z
  .looseObject({
    // The name a user entered when registering (since April 2026). Used for making sure we don't replace the user's
    // name with the Feide name if an admin has manually updated it.
    full_name: z.string(),
  })
  .partial()

export type Auth0UserProfileUserMetadata = z.infer<typeof Auth0UserProfileUserMetadataSchema>

// Old users from OnlineWeb 4 (previous version of the website) may have some metadata used for the migration into
// Auth0. Only the fields defined here should still be in active use.
export const Auth0UserProfileAppMetadataSchema = z
  .looseObject({
    // The user's full name as provided by Feide. Used for replacing user-entered names.
    feide_full_name: z.string(),
    // Immutable copy of user metadata field `full_name`. Semantically, user metadata is editable by the user.
    initial_full_name: z.string(),
  })
  .partial()

export type Auth0UserProfileAppMetadata = z.infer<typeof Auth0UserProfileAppMetadataSchema>
