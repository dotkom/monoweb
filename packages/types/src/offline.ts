import { z } from "zod"
import { StaticAssetSchema } from "./static-asset"

export const OfflineSchema = z.object({
  id: z.string().ulid(),
  title: z.string().max(1000).min(1),
  published: z.date(),
  file: StaticAssetSchema,
  image: StaticAssetSchema,
})

export const OfflineWriteSchema = OfflineSchema.omit({
  id: true,
  file: true,
  image: true,
}).extend({
  fileId: z.string().ulid(),
  imageId: z.string().ulid(),
})

export type Offline = z.infer<typeof OfflineSchema>
export type OfflineId = Offline["id"]
export type OfflineWrite = z.infer<typeof OfflineWriteSchema>
