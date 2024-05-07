import type { Database } from "@dotkomonline/db"
import type { DB } from "@dotkomonline/db/src/db.generated"
import {
  type Offline,
  type OfflineId,
  OfflineSchema,
  type OfflineWithoutAssets,
  type OfflineWrite,
} from "@dotkomonline/types"
import type { ExpressionBuilder, Kysely } from "kysely"
import { jsonObjectFrom } from "kysely/helpers/postgres"
import { z } from "zod"
import { type Cursor, type Keys, orderedQuery } from "../../utils/db-utils"

export const OfflineRepositorySchemas = {
  get: z.object({
    id: z.string().ulid(),
    title: z.string().max(1000).min(1),
    published: z.date(),
    file_asset_key: z.string(),
    image_id: z.string(),
  }),
}

export interface OfflineRepository {
  getById(id: OfflineId): Promise<OfflineWithoutAssets | null>
  getAll(take: number, cursor?: Cursor): Promise<Offline[]>
  create(values: OfflineWrite): Promise<Offline>
  update(id: OfflineId, data: Partial<OfflineWrite>): Promise<Offline>
}

export class OfflineRepositoryImpl implements OfflineRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(data: OfflineWrite): Promise<Offline> {
    const offline = await this.db.insertInto("offline").values(data).returningAll().executeTakeFirstOrThrow()
    return this.getById(offline.id) as Promise<Offline>
  }

  async update(id: OfflineId, data: Partial<OfflineWrite>): Promise<Offline> {
    await this.db
      .updateTable("offline")
      .set({ ...data, updatedAt: new Date() })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()

    return this.getById(id) as Promise<Offline>
  }

  async getById(id: string) {
    const query = await this.db
      .selectFrom("offline")
      .select(["id", "title", "published"])
      .select((eb) => [
        this.assetQuery("pdfAssetKey")(eb).as("pdfAsset"),
        this.imgQuery("imageVariationId")(eb).as("imageVariation"),
      ])
      .where("id", "=", id)
      .executeTakeFirstOrThrow()

    const offline: Keys<Offline> = {
      id: query.id,
      title: query.title,
      published: query.published,
      image: query.imageVariation,
      fileAsset: query.pdfAsset,
    }

    if (!offline) {
      return null
    }

    return OfflineSchema.parse(offline)
  }

  async getAll(take: number, cursor?: Cursor): Promise<Offline[]> {
    const query = this.db
      .selectFrom("offline")
      .selectAll("offline")
      .select((eb) => [
        this.assetQuery("pdfAssetKey")(eb).as("pdfAsset"),
        this.imgQuery("imageVariationId")(eb).as("imageVariation"),
      ])
      .orderBy("offline.createdAt", "desc")
      .limit(take)

    const ordered = orderedQuery(query, cursor)
    const offlines = await ordered.execute()

    const result: Offline[] = []

    for (const offline of offlines) {
      const parsed: Keys<Offline> = {
        id: offline.id,
        title: offline.title,
        published: offline.published,
        image: offline.imageVariation,
        fileAsset: offline.pdfAsset,
      }

      result.push(OfflineSchema.parse(parsed))
    }

    return result
  }
  private imgQuery(col: keyof DB["offline"]) {
    return (eb: ExpressionBuilder<DB, "offline">) =>
      jsonObjectFrom(
        eb
          .selectFrom("imageVariation")
          .select(["crop", "assetKey", "id"])
          .whereRef(`offline.${col}`, "=", "id")
          .select((eb2) => [this.assetQuery("pdfAssetKey")(eb2).as("asset")])
      )
  }

  private assetQuery(col: keyof DB["offline"]) {
    return (eb: ExpressionBuilder<DB, "offline">) =>
      jsonObjectFrom(
        eb
          .selectFrom("asset")
          .select(["key", "originalFilename", "mimeType", "size", "width", "height", "altText"])
          .whereRef(`offline.${col}`, "=", "asset.key")
      )
  }
}
