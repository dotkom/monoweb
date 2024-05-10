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
import type { ExpressionBuilder, Kysely } from "kysely"
import { jsonObjectFrom } from "kysely/helpers/postgres"
import { IllegalStateError } from "../../error"
import { type Cursor, fixJsonDatesStandardCols, type Keys, orderedQuery, withInsertJsonValue } from "../../utils/db-utils"

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

  getAllFileAssets(take: number, cursor?: Cursor): Promise<FileAsset[]>
  getAllImageAssets(take: number, cursor?: Cursor): Promise<ImageAsset[]>
}

export const fileAssetCols = [
  "key",
  "originalFilename",
  "mimeType",
  "size",
  "createdAt",
  "title",
  "tags",
  "isImage",
] as const
export const imageAssetCols = [...fileAssetCols, "width", "height", "altText", "photographer"] as const

export class AssetRepositoryImpl implements AssetRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getAllFileAssets(take: number, cursor?: Cursor): Promise<FileAsset[]> {
    const dbResult = await orderedQuery(
      this.db.selectFrom("asset").select(fileAssetCols).where("isImage", "=", false).limit(take),
      cursor
    ).execute()

    const mappedToDomain: Keys<FileAsset>[] = dbResult
    return mappedToDomain.map((val) => FileAssetSchema.parse(val))
  }

  async getAllImageAssets(take: number, cursor?: Cursor): Promise<ImageAsset[]> {
    const dbResult = await orderedQuery(
      this.db.selectFrom("asset").select(imageAssetCols).where("isImage", "=", true).limit(take),
      cursor
    ).execute()

    const mappedToDomain: Keys<ImageAsset>[] = dbResult
    return mappedToDomain.map((val) => ImageAssetSchema.parse(val))
  }

  async getFileAsset(key: string): Promise<FileAsset> {
    const dbResult = await this.db
      .selectFrom("asset")
      .select(fileAssetCols)
      .where("key", "=", key)
      .executeTakeFirstOrThrow()

    const mappedToDomain: Keys<FileAsset> = dbResult
    return FileAssetSchema.parse(mappedToDomain)
  }

  async getImageAsset(key: string): Promise<ImageAsset> {
    const asset_ = await this.db
      .selectFrom("asset")
      .select(imageAssetCols)
      .where("key", "=", key)
      .executeTakeFirstOrThrow()
    const mappedToDomain: Keys<ImageAsset> = asset_
    return ImageAssetSchema.parse(mappedToDomain)
  }

  async createFileAsset(values: FileAssetWrite): Promise<FileAsset> {
    const asset_ = await this.db
      .insertInto("asset")
      .values(
        withInsertJsonValue(
          {
            ...values,
            isImage: false,
          },
          "tags"
        )
      )
      .returningAll()
      .executeTakeFirstOrThrow()
    const mappedToDomain: Keys<FileAsset> = asset_
    return FileAssetSchema.parse(mappedToDomain)
  }

  async updateFileAsset(id: string, values: FileAssetUpdate): Promise<FileAsset> {
    await this.db.updateTable("asset").set(withInsertJsonValue(values, "tags")).where("key", "=", id).execute()
    return this.getFileAsset(id)
  }

  async createImageAsset(values: ImageAssetWrite): Promise<ImageAsset> {
    const asset_ = await this.db
      .insertInto("asset")
      .values(
        withInsertJsonValue(
          {
            ...values,
            isImage: true,
          },
          "tags"
        )
      )
      .returning(imageAssetCols)
      .executeTakeFirstOrThrow()
    const mappedToDomain: Keys<ImageAsset> = asset_
    return ImageAssetSchema.parse(mappedToDomain)
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
      ...imgVariant,
      asset: fixJsonDatesStandardCols(imgVariant.asset),
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
      jsonObjectFrom(eb.selectFrom("asset").select(imageAssetCols).whereRef(`imageVariant.${col}`, "=", "asset.key"))
  }
}
