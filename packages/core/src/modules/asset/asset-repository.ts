import type { Database } from "@dotkomonline/db"
import type { DB } from "@dotkomonline/db/src/db.generated"
import {
  type FileAsset,
  FileAssetSchema,
  type FileAssetWrite,
  type ImageAsset,
  ImageAssetSchema,
  type ImageAssetWrite,
  type ImageVariant,
  ImageVariantSchema,
  type ImageVariantWrite,
} from "@dotkomonline/types"
import type { ExpressionBuilder, Kysely } from "kysely"
import { jsonObjectFrom } from "kysely/helpers/postgres"
import { type Keys, withInsertJsonValue } from "../../utils/db-utils"

export interface AssetRepository {
  getFileAsset(key: string): Promise<FileAsset>

  createFileAsset(values: FileAssetWrite): Promise<FileAsset>

  createImageAsset(values: ImageAssetWrite): Promise<ImageAsset>

  createImageVariation(values: ImageVariantWrite): Promise<ImageVariant>
  getImageVariation(id: string): Promise<ImageVariant>
  updateImageVariation(id: string, values: ImageVariantWrite): Promise<ImageVariant>
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

  async getImageVariation(id: string): Promise<ImageVariant> {
    const imageVariation_ = await this.db
      .selectFrom("imageVariant")
      .select(["id", "crop"])
      .select((eb) => [this.assetQuery("assetKey")(eb).as("asset")])
      .where("id", "=", id)
      .executeTakeFirstOrThrow()

    const imageVariant: Keys<ImageVariant> = {
      crop: imageVariation_.crop,
      asset: imageVariation_.asset,
      id: imageVariation_.id,
    }
    return ImageVariantSchema.parse(imageVariant)
  }

  async createImageVariation(values: ImageVariantWrite): Promise<ImageVariant> {
    const { id } = await this.db
      .insertInto("imageVariant")
      .values(withInsertJsonValue(values, "crop"))
      .returning("id")
      .executeTakeFirstOrThrow()
    return this.getImageVariation(id)
  }

  async updateImageVariation(id: string, values: ImageVariantWrite): Promise<ImageVariant> {
    await this.db.updateTable("imageVariant").set(withInsertJsonValue(values, "crop")).where("id", "=", id).execute()
    return this.getImageVariation(id)
  }

  private assetQuery(col: keyof DB["imageVariant"]) {
    return (eb: ExpressionBuilder<DB, "imageVariant">) =>
      jsonObjectFrom(
        eb
          .selectFrom("asset")
          .select(["key", "originalFilename", "mimeType", "size", "width", "height", "altText"])
          .whereRef(`imageVariant.${col}`, "=", "asset.key")
      )
  }
}
