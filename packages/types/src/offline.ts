import { schemas } from "@dotkomonline/db/schemas"
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

export const OFFLINE_FILE_MAX_SIZE_KIB = 50 * 1024
export const OFFLINE_IMAGE_MAX_SIZE_KIB = 5 * 1024
