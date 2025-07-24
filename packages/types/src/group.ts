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

export const GroupMemberPeriodSchema = schemas.GroupMemberPeriodSchema.extend({})

export type GroupMemberPeriod = z.infer<typeof GroupMemberPeriodSchema>

export type GroupMemberPeriodWrite = z.infer<typeof GroupMemberPeriodSchema>

export const GroupMemberSchema = schemas.GroupMemberSchema.extend({
  periods: GroupMemberPeriodSchema.array().min(1),
  user: UserSchema,
})

export type GroupMember = z.infer<typeof GroupMemberSchema>

export const GroupMemberWriteSchema = GroupMemberSchema.omit({ user: true })

export type GroupMemberWrite = z.infer<typeof GroupMemberWriteSchema>

export type GroupMemberRole = z.infer<typeof schemas.GroupMemberRoleSchema>

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

export const getGroupRoleName = (role: GroupMemberRole | null | undefined) => {
  switch (role) {
    case "LEDER":
      return "Leder"
    case "NESTLEDER":
      return "Nestleder"
    case "OKONOMIANSVARLIG":
      return "Økonomiansvarlig"
    case "TILLITSVALGT":
      return "Tillitsvalgt"
    case "VINSTRAFFANSVARLIG":
      return "Vinstraffansvarlig"
    case "MEDLEM":
      return "Medlem"
    default:
      return "Ukjent rolle"
  }
}

export const getGroupRoleNames = (roles: GroupMemberRole[] | null | undefined) => {
  if (!roles) {
    return getGroupRoleName(null)
  }

  return roles.map((role) => getGroupRoleName(role)).join(", ")
}
