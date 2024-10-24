import { z } from "zod"

export const ASSET_TAGS = [
  "Artikkel",
  "Bedriftslogo",
  "Arrangement",
  "Offline",
  "Fotoalbum",
  "Produktbilde",
  "Ressurs",
  "Gruppe",
]

export const AssetMedatadaSchema = z.record(z.unknown())

export const BaseAssetSchema = z.object({
  key: z.string(),
  originalFilename: z.string(),
  size: z.number(),
  mimeType: z.string(),
  createdAt: z.date(),
  title: z.string(),
  tags: z.array(z.string()).refine((tags) => tags.every((tag) => ASSET_TAGS.includes(tag))),
})

export const FileAssetSchema = BaseAssetSchema
export const ImageAssetSchema = BaseAssetSchema.extend({
  width: z.number(),
  height: z.number(),
  altText: z.string(),
  photographer: z.string(),
})

export const FileAssetWriteSchema = FileAssetSchema.omit({ createdAt: true })
export const FileAssetUpdateSchema = FileAssetSchema.pick({
  tags: true,
  title: true,
})

export const ImageAssetWriteSchema = ImageAssetSchema.omit({ createdAt: true })
export const ImageAssetUpdateSchema = ImageAssetSchema.pick({
  tags: true,
  title: true,
  altText: true,
  photographer: true,
})

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
export type FileAssetUpdate = z.infer<typeof FileAssetUpdateSchema>
export type ImageAssetWrite = z.infer<typeof ImageAssetWriteSchema>
export type ImageAssetUpdate = z.infer<typeof ImageAssetUpdateSchema>
export type ImageCrop = z.infer<typeof ImageCropSchema>
export type ImageVariant = z.infer<typeof ImageVariantSchema>
export type ImageVariantWrite = z.infer<typeof ImageVariantWriteSchema>
