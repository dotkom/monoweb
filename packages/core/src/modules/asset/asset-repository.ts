import type { Database } from "@dotkomonline/db"
import { jsonObjectFrom } from 'kysely/helpers/postgres'
import type { Kysely } from "kysely"
import { type Keys, withInsertJsonValue } from "../../utils/db-utils"
import {
  FileAssetSchema,
  ImageAssetSchema,
  ImageVariationSchema,
  type FileAsset,
  type FileAssetWrite,
  type ImageAsset,
  type ImageAssetWrite,
  type ImageVariation,
  type ImageVariationWrite,
} from "@dotkomonline/types"

export const assetCols = [
  "asset.key as key",
  "asset.originalFilename",
  "asset.mimeType",
  "asset.size",
  "asset.width",
  "asset.height",
  "asset.altText",
] as const

export interface AssetRepository {
  getFileAsset(key: string): Promise<FileAsset>

  createFileAsset(values: FileAssetWrite): Promise<FileAsset>

  createImageAsset(values: ImageAssetWrite): Promise<ImageAsset>

  createImageVariation(values: ImageVariationWrite): Promise<ImageVariation>
  getImageVariation(id: string): Promise<ImageVariation>
  updateImageVariation(id: string, values: ImageVariationWrite): Promise<ImageVariation>
}

export class AssetRepositoryImpl implements AssetRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getFileAsset(key: string): Promise<FileAsset> {
    const asset_ = await this.db
      .selectFrom("asset")
      .select(["key", "originalFilename", "mimeType", "size"])
      .where("key", "=", key)
      .executeTakeFirstOrThrow()
    const asset: Keys<FileAsset> = asset_
    return FileAssetSchema.parse(asset)
  }

  async createFileAsset(values: FileAssetWrite): Promise<FileAsset> {
    const asset_ = await this.db.insertInto("asset").values(values).returningAll().executeTakeFirstOrThrow()
    const asset: Keys<FileAsset> = asset_
    return FileAssetSchema.parse(asset)
  }

  async createImageAsset(values: ImageAssetWrite): Promise<ImageAsset> {
    const asset_ = await this.db
      .insertInto("asset")
      .values(values)
      .returning(["key", "originalFilename", "mimeType", "size", "width", "height", "altText"])
      .executeTakeFirstOrThrow()
    const asset: Keys<ImageAsset> = asset_
    return ImageAssetSchema.parse(asset)
  }

  async getImageVariation(id: string): Promise<ImageVariation> {
    const imageVariation_ = await this.db
      .selectFrom("imageVariation")
      .select(["id", "crop"])
      .select((eb) => [
        jsonObjectFrom(
          eb.
          selectFrom("asset").
          select(["key", "originalFilename", "mimeType", "size", "width", "height", "altText"]).
          whereRef("imageVariation.assetKey", "=", "asset.key")
        ).as("asset")
      ])
      .where("id", "=", id)
      .executeTakeFirstOrThrow()

    const imageVariation: Keys<ImageVariation> = {
      crop: imageVariation_.crop,
      asset: imageVariation_.asset,
      id: imageVariation_.id,
    }
    return ImageVariationSchema.parse(imageVariation)
  }

  async createImageVariation(values: ImageVariationWrite): Promise<ImageVariation> {
    const { id } = await this.db
      .insertInto("imageVariation")
      .values(withInsertJsonValue(values, "crop"))
      .returning("id")
      .executeTakeFirstOrThrow()
    return this.getImageVariation(id)
  }

  async updateImageVariation(id: string, values: ImageVariationWrite): Promise<ImageVariation> {
    await this.db.updateTable("imageVariation").set(withInsertJsonValue(values, "crop")).where("id", "=", id).execute()
    return this.getImageVariation(id)
  }
}
