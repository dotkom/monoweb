import { z } from "zod"
import { FileAssetSchema, ImageVariationSchema } from "./asset"

export const OfflineSchemaWithoutAssets = z.object({
  id: z.string().ulid(),
  title: z.string().max(1000).min(1),
  published: z.date(),
  fileAsset: FileAssetSchema, // joining with asset is cheap and file name may be used
  image: ImageVariationSchema,
})

export const OfflineSchema = z.object({
  id: z.string().ulid(),
  title: z.string().max(1000).min(1),
  published: z.date(),
  fileAsset: FileAssetSchema, // joining with asset is cheap and file name may be used
  image: ImageVariationSchema,
})

export const OfflineWriteSchema = OfflineSchema.omit({
  id: true,
  image: true,
  fileAsset: true,
}).extend({
  imageId: z.string(),
  fileAssetKey: z.string(),
})

export type Offline = z.infer<typeof OfflineSchema>
export type OfflineId = Offline["id"]
export type OfflineWrite = z.infer<typeof OfflineWriteSchema>

export type OfflineWithoutAssets = z.infer<typeof OfflineSchemaWithoutAssets>
