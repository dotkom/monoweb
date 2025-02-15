import { schemas } from "@dotkomonline/db"
import type { z } from "zod"

export const MarkSchema = schemas.MarkSchema.extend({})

export type MarkId = Mark["id"]
export type Mark = z.infer<typeof MarkSchema>

export const MarkWriteSchema = MarkSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type MarkWrite = z.infer<typeof MarkWriteSchema>
