import { z } from "zod"

export const AssetMedatadaSchema = z.record(z.unknown())

const BaseAssetSchema = z.object({
  key: z.string(),
  originalFilename: z.string(),
  size: z.number(),
  mimeType: z.string(),
})

export const FileAssetSchema = BaseAssetSchema
export const ImageAssetSchema = BaseAssetSchema.extend({
  width: z.number(),
  height: z.number(),
  altText: z.string(),
})

export const FileAssetWriteSchema = FileAssetSchema
export const ImageAssetWriteSchema = ImageAssetSchema

// Unit is always px
export const ImageCropSchema = z.object({
  left: z.number(),
  top: z.number(),
  width: z.number(),
  height: z.number(),
})

export const ImageVariationSchema = z.object({
  id: z.string(),
  crop: ImageCropSchema.nullable(),
  asset: ImageAssetSchema,
})

export const ImageVariationWriteSchema = z.object({
  crop: ImageCropSchema.nullable(),
  altText: z.string(),
  assetKey: z.string(),
})

export type FileAsset = z.infer<typeof FileAssetSchema>
export type ImageAsset = z.infer<typeof ImageAssetSchema>
export type FileAssetWrite = z.infer<typeof FileAssetWriteSchema>
export type ImageAssetWrite = z.infer<typeof ImageAssetWriteSchema>
export type ImageCrop = z.infer<typeof ImageCropSchema>
export type ImageVariation = z.infer<typeof ImageVariationSchema>
export type ImageVariationWrite = z.infer<typeof ImageVariationWriteSchema>
