import type { z } from "zod"

import { schemas } from "@dotkomonline/db/schemas"
import { UserSchema } from "./user"

export const GroupSchema = schemas.GroupSchema.extend({})
export const GroupTypeSchema = schemas.GroupTypeSchema

export type GroupId = Group["slug"]
export type Group = z.infer<typeof GroupSchema>

export type GroupType = z.infer<typeof GroupTypeSchema>

export const GroupWriteSchema = GroupSchema.omit({
  slug: true,
  createdAt: true,
})

export type GroupWrite = z.infer<typeof GroupWriteSchema>

export const GroupRoleSchema = schemas.GroupRoleSchema.extend({})
export type GroupRole = z.infer<typeof GroupRoleSchema>

export const GroupMembershipSchema = schemas.GroupMembershipSchema.extend({
  roles: GroupRoleSchema.array(),
})

export const GroupMemberSchema = UserSchema.extend({
  groupMemberships: GroupMembershipSchema.array(),
})
export type GroupMember = z.infer<typeof GroupMemberSchema>

export type GroupMembership = z.infer<typeof GroupMembershipSchema>

export const GroupMembershipWriteSchema = GroupMembershipSchema.omit({ roles: true })
export type GroupMembershipId = GroupMembership["id"]
export type GroupMembershipWrite = z.infer<typeof GroupMembershipWriteSchema>

export const getDefaultGroupMemberRoles = (groupId: GroupId) =>
  [
    { groupId, type: "LEADER", name: "Leder" },
    { groupId, type: "PUNISHER", name: "Vinstraffansvarlig" },
    { groupId, type: "COSMETIC", name: "Nestleder" },
    { groupId, type: "COSMETIC", name: "Tillitsvalgt" },
    { groupId, type: "COSMETIC", name: "Økonomiansvarlig" },
    { groupId, type: "COSMETIC", name: "Medlem" },
  ] as const satisfies GroupRole[]

export const createGroupPageUrl = (group: Group) => {
  switch (group.type) {
    case "COMMITTEE":
      return `/komiteer/${group.slug}`
    case "NODE_COMMITTEE":
      return `/nodekomiteer/${group.slug}`
    case "ASSOCIATED":
      return `/andre-grupper/${group.slug}`
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
      return "Annen gruppe"
    case "INTEREST_GROUP":
      return "Interessegruppe"
    default:
      return "Ukjent type"
  }
}
