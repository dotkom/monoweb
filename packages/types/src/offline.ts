import { schemas } from "@dotkomonline/db"
import type { z } from "zod"

export const OfflineSchema = schemas.OfflineSchema.extend({})

export const OfflineWriteSchema = OfflineSchema.partial({
  id: true,
  updatedAt: true,
  createdAt: true,
})

export type Offline = z.infer<typeof OfflineSchema>
export type OfflineId = Offline["id"]
export type OfflineWrite = z.infer<typeof OfflineWriteSchema>
