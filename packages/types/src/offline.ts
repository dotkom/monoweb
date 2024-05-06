import { z } from "zod"
import { ImageSchema } from "./asset"

export const OfflineSchema = z.object({
  id: z.string().ulid(),
  title: z.string().max(1000).min(1),
  published: z.date(),
  fileId: z.string(),
  image: ImageSchema,
})

export const OfflineWriteSchema = OfflineSchema.omit({
  id: true,
  image: true
}).extend({
  imageId: z.string(),
})

export type Offline = z.infer<typeof OfflineSchema>
export type OfflineId = Offline["id"]
export type OfflineWrite = z.infer<typeof OfflineWriteSchema>
