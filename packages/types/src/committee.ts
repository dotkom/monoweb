import type { z } from "zod"

import { schemas } from "@dotkomonline/db"

export const CommitteeSchema = schemas.CommitteeSchema.extend({})

export type CommitteeId = Committee["id"]
export type Committee = z.infer<typeof CommitteeSchema>

export const CommitteeWriteSchema = CommitteeSchema.partial({
  id: true,
  createdAt: true,
})

export type CommitteeWrite = z.infer<typeof CommitteeWriteSchema>
