import type { z } from "zod"

import { schemas } from "@dotkomonline/db/schemas"

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

export const GroupMemberSchema = schemas.GroupMemberSchema.extend({})

export type GroupMember = z.infer<typeof GroupMemberSchema>

export const GroupMemberWriteSchema = GroupMemberSchema

export type GroupMemberWrite = z.infer<typeof GroupMemberWriteSchema>

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
