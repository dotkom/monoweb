import { z } from "zod"

export const AssetMedatadaSchema = z.record(z.unknown())

export const AssetSchema = z.object({
  id: z.string(),
  originalFilename: z.string(),
  size: z.number(),
  metadata: AssetMedatadaSchema.nullable(),
})

export const AssetWriteSchema = AssetSchema

// Unit is always px
export const ImageCropSchema = z.object({
  left: z.number(),
  top: z.number(),
  width: z.number(),
  height: z.number(),
})

export const ImageSchema = z.object({
  id: z.string(),
  crop: ImageCropSchema.nullable(),
  altText: z.string(),
  assetId: z.string(),
})

export const ImageWriteSchema = z.object({
  crop: ImageCropSchema.nullable(),
  altText: z.string(),
  assetId: z.string(),
})

export type Asset = z.infer<typeof AssetSchema>
export type AssetWrite = z.infer<typeof AssetSchema>
export type AssetId = Asset["id"]
export type Image = z.infer<typeof ImageSchema>
export type AssetMedatada = z.infer<typeof AssetMedatadaSchema>
export type ImageWrite = z.infer<typeof ImageWriteSchema>
