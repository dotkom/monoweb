import type { z } from "zod"

import { schemas } from "@dotkomonline/db/schemas"

export const InterestGroupSchema = schemas.InterestGroupSchema.extend({})

export type InterestGroup = z.infer<typeof InterestGroupSchema>
export type InterestGroupId = InterestGroup["id"]

export const InterestGroupWriteSchema = InterestGroupSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type InterestGroupWrite = z.infer<typeof InterestGroupWriteSchema>
