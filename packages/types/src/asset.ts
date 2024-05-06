import { z } from "zod"

export const AssetMedatadaSchema = z.record(z.unknown())

export const AssetSchema = z.object({
  key: z.string(),
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
  assetKey: z.string(),
})

export const ImageWriteSchema = z.object({
  crop: ImageCropSchema.nullable(),
  altText: z.string(),
  assetKey: z.string(),
})

export type Asset = z.infer<typeof AssetSchema>
export type AssetWrite = z.infer<typeof AssetSchema>
export type AssetKey = Asset["key"]
export type Image = z.infer<typeof ImageSchema>
export type AssetMedatada = z.infer<typeof AssetMedatadaSchema>
export type ImageWrite = z.infer<typeof ImageWriteSchema>
