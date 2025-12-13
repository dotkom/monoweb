import type { z } from "zod"

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
})
export const GroupTypeSchema = schemas.GroupTypeSchema

export type GroupId = Group["slug"]
export type Group = z.infer<typeof GroupSchema>

export type GroupType = z.infer<typeof GroupTypeSchema>

export const GroupRecruitmentMethodSchema = schemas.GroupRecruitmentMethodSchema
export type GroupRecruitmentMethod = z.output<typeof GroupRecruitmentMethodSchema>

export const GroupMemberVisibilitySchema = schemas.GroupMemberVisibilitySchema
export type GroupMemberVisibilityType = z.infer<typeof GroupMemberVisibilitySchema>

export const GroupWriteSchema = GroupSchema.pick({
  type: true,
  name: true,
  slug: true,
  abbreviation: true,
  description: true,
  imageUrl: true,
  email: true,
  contactUrl: true,
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

export const getDefaultGroupMemberRoles = (groupId: GroupId) =>
  [
    { groupId, type: "LEADER", name: "Leder" },
    { groupId, type: "PUNISHER", name: "Vinstraffansvarlig" },
    { groupId, type: "DEPUTY_LEADER", name: "Nestleder" },
    { groupId, type: "TRUSTEE", name: "Tillitsvalgt" },
    { groupId, type: "TREASURER", name: "Økonomiansvarlig" },
    { groupId, type: "COSMETIC", name: "Medlem" },
    { groupId, type: "EMAIL_ONLY", name: "Epost-bruker" },
  ] as const satisfies GroupRoleWrite[]

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
    case "LEADER":
      return "Leder"
    case "PUNISHER":
      return "Vinstraffansvarlig"
    case "COSMETIC":
      return "Kosmetisk"
    case "DEPUTY_LEADER":
      return "Nestleder"
    case "TRUSTEE":
      return "Tillitsvalgt"
    case "TREASURER":
      return "Økonomiansvarlig"
    case "EMAIL_ONLY":
      return "E-postbruker"
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
