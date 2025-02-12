import { dbSchemas } from "@dotkomonline/db"
import type { z } from "zod"

export const MarkSchema = dbSchemas.MarkSchema.extend({})

export type MarkId = Mark["id"]
export type Mark = z.infer<typeof MarkSchema>

export const MarkWriteSchema = MarkSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type MarkWrite = z.infer<typeof MarkWriteSchema>
