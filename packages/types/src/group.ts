import { z } from "zod"

import { schemas } from "@dotkomonline/db/schemas"
import { compareDesc } from "date-fns"
import { UserSchema } from "./user"

export const GroupRoleSchema = schemas.GroupRoleSchema.extend({})
export type GroupRole = z.infer<typeof GroupRoleSchema>
export type GroupRoleId = GroupRole["id"]

export const GroupRoleWriteSchema = GroupRoleSchema.pick({
  groupId: true,
  name: true,
  type: true,
})

export type GroupRoleWrite = z.infer<typeof GroupRoleWriteSchema>

export const GroupSchema = schemas.GroupSchema.extend({
  roles: GroupRoleSchema.array(),
  eventCount: z.number().optional(),
})
export const GroupTypeSchema = schemas.GroupTypeSchema

export type GroupId = Group["slug"]
export type Group = z.infer<typeof GroupSchema>

export type GroupType = z.infer<typeof GroupTypeSchema>

export const GroupRecruitmentMethodSchema = schemas.GroupRecruitmentMethodSchema
export type GroupRecruitmentMethod = z.output<typeof GroupRecruitmentMethodSchema>

export const GroupMemberVisibilitySchema = schemas.GroupMemberVisibilitySchema
export type GroupMemberVisibilityType = z.infer<typeof GroupMemberVisibilitySchema>

export const GroupPreferredDisplayNameSchema = schemas.GroupPreferredDisplayNameSchema
export type GroupPreferredDisplayName = z.infer<typeof GroupPreferredDisplayNameSchema>

export const GroupWriteSchema = GroupSchema.pick({
  type: true,
  name: true,
  slug: true,
  abbreviation: true,
  preferredDisplayName: true,
  description: true,
  imageUrl: true,
  email: true,
  contactUrl: true,
  slackUrl: true,
  showLeaderAsContact: true,
  memberVisibility: true,
  deactivatedAt: true,
  workspaceGroupId: true,
  recruitmentMethod: true,
}).partial({
  slug: true,
})

export type GroupWrite = z.infer<typeof GroupWriteSchema>

export const GroupRoleTypeSchema = schemas.GroupRoleTypeSchema
export const GroupRoleTypeEnum = GroupRoleTypeSchema.enum
export type GroupRoleType = z.infer<typeof GroupRoleTypeSchema>

export const GroupMembershipSchema = schemas.GroupMembershipSchema.extend({
  roles: GroupRoleSchema.array(),
})

export const GroupMemberSchema = UserSchema.extend({
  groupMemberships: GroupMembershipSchema.array(),
})
export type GroupMember = z.infer<typeof GroupMemberSchema>

export type GroupMembership = z.infer<typeof GroupMembershipSchema>

export const GroupMembershipWriteSchema = GroupMembershipSchema.omit({
  roles: true,
  id: true,
  createdAt: true,
  updatedAt: true,
})
export type GroupMembershipId = GroupMembership["id"]
export type GroupMembershipWrite = z.infer<typeof GroupMembershipWriteSchema>

export const GroupMembershipWriteWithRolesSchema = GroupMembershipWriteSchema.extend({
  roleIds: z.set(GroupRoleSchema.shape.id),
})
export type GroupMembershipWriteWithRoles = z.infer<typeof GroupMembershipWriteWithRolesSchema>

// NOTE: We omit `EDITOR_IN_CHIEF` ("Redaktør"), since the role is only relevant for Prokom, the committee managing
// Online's magazine "Offline".
export const getDefaultGroupMemberRoles = (groupId: GroupId) =>
  [
    { groupId, type: GroupRoleTypeEnum.LEADER, name: "Leder" },
    { groupId, type: GroupRoleTypeEnum.PUNISHER, name: "Vinstraffansvarlig" },
    { groupId, type: GroupRoleTypeEnum.DEPUTY_LEADER, name: "Nestleder" },
    { groupId, type: GroupRoleTypeEnum.TRUSTEE, name: "Tillitsvalgt" },
    { groupId, type: GroupRoleTypeEnum.TREASURER, name: "Økonomiansvarlig" },
    { groupId, type: GroupRoleTypeEnum.COSMETIC, name: "Medlem" },
    { groupId, type: GroupRoleTypeEnum.EMAIL_ONLY, name: "E-postbruker" },
    { groupId, type: GroupRoleTypeEnum.TEMPORARILY_LEAVE, name: "Permitert" },
  ] as const satisfies GroupRoleWrite[]

export const getGroupDisplayName = (group: Pick<Group, "abbreviation" | "name" | "preferredDisplayName">) => {
  if (group.preferredDisplayName === "NAME") {
    return group.name ?? group.abbreviation
  }
  return group.abbreviation
}

export const getGroupSecondaryName = (group: Pick<Group, "abbreviation" | "name" | "preferredDisplayName">) => {
  const displayName = getGroupDisplayName(group)
  const otherName = group.preferredDisplayName === "NAME" ? group.abbreviation : group.name

  if (!otherName || otherName === displayName) {
    return null
  }

  return otherName
}

export const getGroupPreferredDisplayNameLabel = (preferredDisplayName: GroupPreferredDisplayName) => {
  switch (preferredDisplayName) {
    case "ABBREVIATION":
      return "Kort navn"
    case "NAME":
      return "Offisielt navn"
    default:
      return "Ukjent"
  }
}

export const createGroupPageUrl = (group: Group) => {
  switch (group.type) {
    case "COMMITTEE":
    case "NODE_COMMITTEE":
    case "ASSOCIATED":
      return `/grupper/${group.slug}`
    case "INTEREST_GROUP":
      return `/interessegrupper/${group.slug}`
    default:
      throw new Error(`Unknown group type: ${group.type}`)
  }
}

export const getGroupTypeName = (type: GroupType | null | undefined) => {
  switch (type) {
    case "COMMITTEE":
      return "Komité"
    case "NODE_COMMITTEE":
      return "Nodekomité"
    case "ASSOCIATED":
      return "Assosiert gruppe"
    case "INTEREST_GROUP":
      return "Interessegruppe"
    case "EMAIL_ONLY":
      return "E-postgruppe"
    default:
      return "Ukjent type"
  }
}

export const getGroupMemberVisibilityName = (name: GroupMemberVisibilityType | null | undefined) => {
  switch (name) {
    case "ALL_MEMBERS":
      return "Alle medlemmer"
    case "WITH_ROLES":
      return "Alle med roller"
    case "LEADER":
      return "Kun leder"
    case "NONE":
      return "Ingen"
    default:
      return "Ukjent"
  }
}

export const getGroupRoleTypeName = (type: GroupRoleType) => {
  switch (type) {
    case GroupRoleTypeEnum.LEADER:
      return "Leder"
    case GroupRoleTypeEnum.PUNISHER:
      return "Vinstraffansvarlig"
    case GroupRoleTypeEnum.COSMETIC:
      return "Kosmetisk"
    case GroupRoleTypeEnum.DEPUTY_LEADER:
      return "Nestleder"
    case GroupRoleTypeEnum.TRUSTEE:
      return "Tillitsvalgt"
    case GroupRoleTypeEnum.TREASURER:
      return "Økonomiansvarlig"
    case GroupRoleTypeEnum.EMAIL_ONLY:
      return "E-postbruker"
    case GroupRoleTypeEnum.TEMPORARILY_LEAVE:
      return "Permitert"
    case GroupRoleTypeEnum.EDITOR_IN_CHIEF:
      return "Redaktør"
    default:
      return "Ukjent type"
  }
}

export const getActiveGroupMembership = (member: GroupMember | null, groupSlug?: GroupId): GroupMembership | null => {
  if (!member) {
    return null
  }

  const isGroup = (inputGroupSlug: GroupId) => (groupSlug ? inputGroupSlug === groupSlug : true)

  // This is to make sure the function is deterministic
  const sortedMemberships = member.groupMemberships.toSorted((a, b) => compareDesc(a.start, b.start))

  return sortedMemberships.find((membership) => membership.end === null && isGroup(membership.groupId)) ?? null
}

export const getGroupRecruitmentMethodName = (recruitmentMethod: GroupRecruitmentMethod): string => {
  switch (recruitmentMethod) {
    case "GENERAL_ASSEMBLY":
      return "Generalforsamling"
    case "AUTUMN_APPLICATION":
      return "Opptak ved høsten"
    case "NOMINATION":
      return "Nominasjoner"
    case "NONE":
      return "Ingen opptak"
    case "OTHER":
      return "Annet ordinært opptak"
    case "SPRING_APPLICATION":
      return "Opptak ved våren"
  }
}

export const areGroupRolesEqual = (rolesA: GroupMembership["roles"], rolesB: GroupMembership["roles"]): boolean => {
  const typesA = new Set(rolesA.map((role) => role.id))
  const typesB = new Set(rolesB.map((role) => role.id))

  return typesA.symmetricDifference(typesB).size === 0
}

export const GROUP_IMAGE_MAX_SIZE_KIB = 5 * 1024
