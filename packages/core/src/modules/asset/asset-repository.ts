import type { Database } from "@dotkomonline/db"
import type { DB } from "@dotkomonline/db/src/db.generated"
import {
  type FileAsset,
  FileAssetSchema,
  type FileAssetUpdate,
  type FileAssetWrite,
  type ImageAsset,
  ImageAssetSchema,
  type ImageAssetUpdate,
  type ImageAssetWrite,
  type ImageVariant,
  ImageVariantSchema,
  type ImageVariantWrite,
} from "@dotkomonline/types"
import type { ExpressionBuilder, Kysely, Selectable } from "kysely"
import { jsonObjectFrom } from "kysely/helpers/postgres"
import { type Keys, withInsertJsonValue } from "../../utils/db-utils"
import { IllegalStateError } from "../../error"

export interface AssetRepository {
  getFileAsset(key: string): Promise<FileAsset>
  getImageAsset(key: string): Promise<ImageAsset>

  createFileAsset(values: FileAssetWrite): Promise<FileAsset>
  updateFileAsset(id: string, values: FileAssetUpdate): Promise<FileAsset>

  createImageAsset(values: ImageAssetWrite): Promise<ImageAsset>
  updateImageAsset(id: string, values: ImageAssetUpdate): Promise<ImageAsset>

  createImageVariation(values: ImageVariantWrite): Promise<ImageVariant>
  getImageVariation(id: string): Promise<ImageVariant>
  updateImageVariation(id: string, values: ImageVariantWrite): Promise<ImageVariant>

  getAllFileAssets(): Promise<FileAsset[]>
  getAllImageAssets(): Promise<ImageAsset[]>
}

const fileAssetCols = ["key", "originalFilename", "mimeType", "size", "createdAt", "title", "tags", "isImage"] as const
const imageAssetCols= [...fileAssetCols, "width", "height", "altText", "photographer"] as const

export class AssetRepositoryImpl implements AssetRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getAllFileAssets(): Promise<FileAsset[]> {
    const assets_ = await this.db
      .selectFrom("asset")
      .select(fileAssetCols)
      .where("isImage", "=", false)
      .execute()
    const assets: Keys<FileAsset>[] = assets_
    return assets.map(val => FileAssetSchema.parse(val))
  }

  async getAllImageAssets(): Promise<ImageAsset[]> {
    const assets_ = await this.db
      .selectFrom("asset")
      .select(imageAssetCols)
      .where("isImage", "=", true)
      .execute()
    const assets: Keys<ImageAsset>[] = assets_
    return assets.map(val => ImageAssetSchema.parse(val))
  }

  async getFileAsset(key: string): Promise<FileAsset> {
    const asset_ = await this.db
      .selectFrom("asset")
      .select(fileAssetCols)
      .where("key", "=", key)
      .executeTakeFirstOrThrow()
    const asset: Keys<FileAsset> = asset_
    return FileAssetSchema.parse(asset)
  }

  async getImageAsset(key: string): Promise<ImageAsset> {
    const asset_ = await this.db
      .selectFrom("asset")
      .select(imageAssetCols)
      .where("key", "=", key)
      .executeTakeFirstOrThrow()
    const asset: Keys<ImageAsset> = asset_
    return ImageAssetSchema.parse(asset)
  }

  async createFileAsset(values: FileAssetWrite): Promise<FileAsset> {
    const asset_ = await this.db.insertInto("asset").values(withInsertJsonValue({
      ...values,
      isImage: false,
    }, "tags")).returningAll().executeTakeFirstOrThrow()
    const asset: Keys<FileAsset> = asset_
    return FileAssetSchema.parse(asset)
  }

  async updateFileAsset(id: string, values: FileAssetUpdate): Promise<FileAsset> {
    await this.db.updateTable("asset").set(withInsertJsonValue(values, "tags")).where("key", "=", id).execute()
    return this.getFileAsset(id)
  }

  async createImageAsset(values: ImageAssetWrite): Promise<ImageAsset> {
    const asset_ = await this.db
      .insertInto("asset")
      .values(withInsertJsonValue({
        ...values,
        isImage: true,
      }, "tags"))
      .returning(imageAssetCols)
      .executeTakeFirstOrThrow()
    const asset: Keys<ImageAsset> = asset_
    return ImageAssetSchema.parse(asset)
  }

  async updateImageAsset(id: string, values: ImageAssetUpdate): Promise<ImageAsset> {
    await this.db.updateTable("asset").set(withInsertJsonValue(values, "tags")).where("key", "=", id).execute()
    return this.getImageAsset(id)
  }

  async getImageVariation(id: string): Promise<ImageVariant> {
    const imgVariant = await this.db
      .selectFrom("imageVariant")
      .select(["id", "crop", "createdAt"])
      .select((eb) => [this.assetQuery("assetKey")(eb).as("asset")])
      .where("id", "=", id)
      .executeTakeFirstOrThrow()

    if (imgVariant.asset === null) {
      throw new IllegalStateError("Image variant has no asset")
    }

    const imageVariant: Keys<ImageVariant> = {
      crop: imgVariant.crop,
      asset: this.mapNestedAssetResult(imgVariant.asset),
      id: imgVariant.id,
      createdAt: imgVariant.createdAt,
    }
    return ImageVariantSchema.parse(imageVariant)
  }

  async createImageVariation(values: ImageVariantWrite): Promise<ImageVariant> {
    const { id } = await this.db
      .insertInto("imageVariant")
      .values({
        ...withInsertJsonValue(values, "crop"),
      })
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
          .select(imageAssetCols)
          .whereRef(`imageVariant.${col}`, "=", "asset.key")
      )
  }

  private mapNestedAssetResult(asset: Keys<Selectable<DB["asset"]>>) {
    return {
      ...asset,
      createdAt: new Date(asset.createdAt as string),
    }
  }
}
