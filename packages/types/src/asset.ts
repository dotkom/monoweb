import { z } from "zod"

export const AssetTags = [
  "Artikkel",
  "Bedriftslogo",
  "Arrangement",
  "Offline",
  "Fotoalbum",
  "Produktbilde",
  "Ressurs",
  "Gruppe",
] as const

export const AssetMedatadaSchema = z.record(z.unknown())

export const BaseAssetSchema = z.object({
  key: z.string(),
  originalFilename: z.string(),
  size: z.number(),
  mimeType: z.string(),
  createdAt: z.date(),
  title: z.string(),
  tags: z.array(z.enum(AssetTags)),
})

export const FileAssetSchema = BaseAssetSchema
export const ImageAssetSchema = BaseAssetSchema.extend({
  width: z.number(),
  height: z.number(),
  altText: z.string(),
  photographer: z.string(),
})

export const FileAssetWriteSchema = FileAssetSchema.omit({ createdAt: true })
export const ImageAssetWriteSchema = ImageAssetSchema.omit({ createdAt: true })

// Unit is always px
export const ImageCropSchema = z.object({
  left: z.number(),
  top: z.number(),
  width: z.number(),
  height: z.number(),
})

export const ImageVariantSchema = z.object({
  id: z.string(),
  crop: ImageCropSchema.nullable(),
  asset: ImageAssetSchema,
  createdAt: z.date(),
})

export const ImageVariantWriteSchema = ImageVariantSchema.omit({ id: true, createdAt: true, asset: true }).extend({
  assetKey: z.string(),
})

export type FileAsset = z.infer<typeof FileAssetSchema>
export type ImageAsset = z.infer<typeof ImageAssetSchema>
export type FileAssetWrite = z.infer<typeof FileAssetWriteSchema>
export type ImageAssetWrite = z.infer<typeof ImageAssetWriteSchema>
export type ImageCrop = z.infer<typeof ImageCropSchema>
export type ImageVariant = z.infer<typeof ImageVariantSchema>
export type ImageVariantWrite = z.infer<typeof ImageVariantWriteSchema>
