import type { Database } from "@dotkomonline/db"
import { type Image, type Offline, type OfflineId, OfflineSchema, type OfflineWrite } from "@dotkomonline/types"
import type { Kysely } from "kysely"
import { type Cursor, type Keys, orderedQuery } from "../../utils/db-utils"

export interface OfflineRepository {
  getById(id: OfflineId): Promise<Offline | null>
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
    const query = this.db
      .selectFrom("offline")
      .select([
        "offline.id",
        "offline.title",
        "offline.createdAt",
        "offline.updatedAt",
        "offline.published",
        "offline.imageId",
        "offline.fileAssetKey",
      ])
      .leftJoin("image", "offline.imageId", "image.id")
      .select(["image.assetKey as imageAssetKey", "image.crop as imageCrop", "image.altText as imageAltText"])
      .where("offline.id", "=", id)

    const result = await query.executeTakeFirst()

    if (!result) {
      return null
    }

    const image: Keys<Image> = {
      id: result.imageId,
      assetKey: result.imageAssetKey,
      crop: result.imageCrop,
      altText: result.imageAltText,
    }

    const parsed: Keys<Offline> = {
      ...result,
      fileAssetKey: result.fileAssetKey,
      image,
    }

    return OfflineSchema.parse(parsed)
  }

  async getAll(take: number, cursor?: Cursor): Promise<Offline[]> {
    const query = this.db
      .selectFrom("offline")
      .selectAll("offline")
      .leftJoin("image", "offline.imageId", "image.id")
      .select(["image.assetKey as imageAssetKey", "image.crop as imageCrop", "image.altText as imageAltText"])
      .orderBy("offline.createdAt", "desc")
      .limit(take)

    const ordered = orderedQuery(query, cursor)
    const offlines = await ordered.execute()

    const result: Offline[] = []

    for (const offline of offlines) {
      const image: Keys<Image> = {
        id: offline.imageId,
        assetKey: offline.imageAssetKey,
        crop: offline.imageCrop,
        altText: offline.imageAltText,
      }

      const parsed: Keys<Offline> = {
        ...offline,
        fileAssetKey: offline.fileAssetKey,
        image,
      }

      result.push(OfflineSchema.parse(parsed))
    }

    return result
  }
}
