import { z } from "zod"
import { dbSchemas } from "@dotkomonline/db"

export const OfflineSchema = dbSchemas.OfflineSchema.extend({})

export const OfflineWriteSchema = OfflineSchema.partial({
  id: true,
  updatedAt: true,
  createdAt: true
})

export type Offline = z.infer<typeof OfflineSchema>
export type OfflineId = Offline["id"]
export type OfflineWrite = z.infer<typeof OfflineWriteSchema>
