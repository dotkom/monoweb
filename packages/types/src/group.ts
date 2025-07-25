import type { z } from "zod"

import { schemas } from "@dotkomonline/db/schemas"
import { UserSchema } from "./user/user"

export const GroupSchema = schemas.GroupSchema.extend({})
export const GroupTypeSchema = schemas.GroupTypeSchema

export type GroupId = Group["id"]
export type Group = z.infer<typeof GroupSchema>

export type GroupType = z.infer<typeof GroupTypeSchema>

export const GroupWriteSchema = GroupSchema.omit({
  id: true,
  createdAt: true,
})

export type GroupWrite = z.infer<typeof GroupWriteSchema>

export type GroupMemberRole = z.infer<typeof schemas.GroupMemberRoleSchema>

export const GroupMemberPeriodSchema = schemas.GroupMemberPeriodSchema.extend({
  roles: schemas.GroupMemberPeriodRoleSchema.array(),
})

export type GroupMemberPeriod = z.infer<typeof GroupMemberPeriodSchema>

export type GroupMemberPeriodWrite = z.infer<typeof GroupMemberPeriodSchema>

export const GroupMemberSchema = schemas.GroupMemberSchema.extend({
  periods: GroupMemberPeriodSchema.array().min(1),
  user: UserSchema,
})

export type GroupMember = z.infer<typeof GroupMemberSchema>

export const GroupMemberWriteSchema = GroupMemberSchema.omit({ user: true })

export type GroupMemberWrite = z.infer<typeof GroupMemberWriteSchema>

export const getDefaultGroupMemberRoles = (groupId: GroupId) =>
  [
    { groupId, name: "Leder" },
    { groupId, name: "Nestleder" },
    { groupId, name: "Tillitsvalgt" },
    { groupId, name: "Økonomiansvarlig" },
    { groupId, name: "Vinstraffansvarlig" },
    { groupId, name: "Medlem" },
  ] as const satisfies GroupMemberRole[]

export const createGroupPageUrl = (group: Group) => {
  switch (group.type) {
    case "COMMITTEE":
      return `/komiteer/${group.id}`
    case "NODECOMMITTEE":
      return `/nodekomiteer/${group.id}`
    case "OTHERGROUP":
      return `/interessegrupper/${group.id}`
    default:
      throw new Error(`Unknown group type: ${group.type}`)
  }
}

export const getGroupTypeName = (type: GroupType | null | undefined) => {
  switch (type) {
    case "COMMITTEE":
      return "Komité"
    case "NODECOMMITTEE":
      return "Nodekomité"
    case "OTHERGROUP":
      return "Annen gruppe"
    default:
      return "Ukjent type"
  }
}
