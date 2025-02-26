import type { z } from "zod"

import { schemas } from "@dotkomonline/db"

export const GroupSchema = schemas.GroupSchema.extend({})
export const GroupTypeSchema = schemas.GroupTypeSchema

export type GroupId = Group["id"]
export type Group = z.infer<typeof GroupSchema>

export type GroupType = z.infer<typeof GroupTypeSchema>

export const GroupWriteSchema = GroupSchema.partial({
  id: true,
  createdAt: true,
})

export type GroupWrite = z.infer<typeof GroupWriteSchema>
