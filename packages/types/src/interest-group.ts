import { z } from "zod"

import { dbSchemas } from "@dotkomonline/db"

export const InterestGroupSchema = dbSchemas.InterestGroupSchema.extend({})

export type InterestGroup = z.infer<typeof InterestGroupSchema>
export type InterestGroupId = InterestGroup["id"]

export const InterestGroupWriteSchema = InterestGroupSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type InterestGroupWrite = z.infer<typeof InterestGroupWriteSchema>
