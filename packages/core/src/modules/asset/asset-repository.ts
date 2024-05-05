import type { Database } from "@dotkomonline/db"
import {
  type Asset,
  type AssetId,
  AssetMedatadaSchema,
  type AssetWrite,
  type Image,
  ImageCropSchema,
  type ImageWrite,
} from "@dotkomonline/types"
import type { Kysely } from "kysely"
import { withInsertJsonValue } from "../../utils/db-utils"

export interface AssetRepository {
  create(values: AssetWrite): Promise<Asset>
  createImage(values: ImageWrite): Promise<Image>
  get(id: string): Promise<Asset>
}

export class AssetRepositoryImpl implements AssetRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async createImage(data: ImageWrite) {
    const inserted = await this.db
      .insertInto("image")
      .values(withInsertJsonValue(data, "crop"))
      .returningAll()
      .executeTakeFirstOrThrow()
    const image: Image = {
      ...inserted,
      crop: ImageCropSchema.parse(inserted.crop),
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

  async get(id: AssetId): Promise<Asset> {
    const asset = await this.db.selectFrom("asset").selectAll().where("id", "=", id).executeTakeFirstOrThrow()

    return {
      ...asset,
      metadata: AssetMedatadaSchema.nullable().parse(asset.metadata),
    }
  }
}
