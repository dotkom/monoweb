import { z } from "zod"

export const StaticAssetSchema = z.object({
  id: z.string().ulid(),
  fileName: z.string(),
  url: z.string(),
  fileType: z.string(),
  createdAt: z.date(),
})

export const StaticAssetWriteSchema = StaticAssetSchema.partial({
  id: true,
})

export type StaticAsset = z.infer<typeof StaticAssetSchema>
export type StaticAssetWrite = z.infer<typeof StaticAssetWriteSchema>
export type StaticAssetId = StaticAsset["id"]
