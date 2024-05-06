import type { Database } from "@dotkomonline/db"
import {
  type Asset,
  type AssetKey,
  AssetMedatadaSchema,
  type AssetWrite,
  type Image,
  ImageCropSchema,
  ImageSchema,
  type ImageWrite,
} from "@dotkomonline/types"
import type { Kysely } from "kysely"
import { withInsertJsonValue } from "../../utils/db-utils"

export interface AssetRepository {
  create(values: AssetWrite): Promise<Asset>
  createImage(values: ImageWrite): Promise<Image>
  updateImage(id: string, values: ImageWrite): Promise<Image>
  get(id: string): Promise<Asset>
  getImage(id: string): Promise<Image>
}

export class AssetRepositoryImpl implements AssetRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getImage(id: string) {
    const asset = await this.db.selectFrom("image").selectAll().where("id", "=", id).executeTakeFirstOrThrow()
    return ImageSchema.parse(asset)
  }

  async updateImage(id: string, data: ImageWrite) {
    const updated = await this.db
      .updateTable("image")
      .set(withInsertJsonValue(data, "crop"))
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()
    const image: Image = {
      ...updated,
      crop: ImageCropSchema.nullable().parse(updated.crop),
    }
    return image
  }

  async createImage(data: ImageWrite) {
    const inserted = await this.db
      .insertInto("image")
      .values(withInsertJsonValue(data, "crop"))
      .returningAll()
      .executeTakeFirstOrThrow()
    const image: Image = {
      ...inserted,
      crop: ImageCropSchema.nullable().parse(inserted.crop),
    }
    return image
  }

  async create(data: AssetWrite): Promise<Asset> {
    const asset = await this.db
      .insertInto("asset")
      .values(withInsertJsonValue(data, "metadata"))
      .returningAll()
      .executeTakeFirstOrThrow()
    return {
      ...asset,
      metadata: AssetMedatadaSchema.nullable().parse(asset.metadata),
    }
  }

  async get(key: AssetKey): Promise<Asset> {
    const asset = await this.db.selectFrom("asset").selectAll().where("key", "=", key).executeTakeFirstOrThrow()

    return {
      ...asset,
      metadata: AssetMedatadaSchema.nullable().parse(asset.metadata),
    }
  }
}
