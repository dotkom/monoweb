import type { Database } from "@dotkomonline/db"
import type { DB } from "@dotkomonline/db/src/db.generated"
import { type Offline, type OfflineId, OfflineSchema, type OfflineWrite } from "@dotkomonline/types"
import type { ExpressionBuilder, Kysely } from "kysely"
import { jsonObjectFrom } from "kysely/helpers/postgres"
import { type Cursor, fixJsonDatesStandardCols, type Keys, orderedQuery } from "../../utils/db-utils"
import { fileAssetCols, imageAssetCols } from "../asset/asset-repository"

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
    const query = await this.db
      .selectFrom("offline")
      .select(["id", "title", "published"])
      .select((eb) => [
        this.assetQuery("pdfAssetKey")(eb).as("pdfAsset"),
        this.imgQuery("imageVariantId")(eb).as("imageVariant"),
      ])
      .where("id", "=", id)
      .executeTakeFirstOrThrow()

    const offline: Keys<Offline> = {
      id: query.id,
      title: query.title,
      published: query.published,
      image: {
        ...fixJsonDatesStandardCols(query?.imageVariant),
        asset: fixJsonDatesStandardCols(query?.imageVariant?.asset),
      },
      pdf: fixJsonDatesStandardCols(query.pdfAsset),
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
        this.imgQuery("imageVariantId")(eb).as("imageVariant"),
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
        image: {
          ...fixJsonDatesStandardCols(offline?.imageVariant),
          asset: fixJsonDatesStandardCols(offline?.imageVariant?.asset),
        },
        pdf: fixJsonDatesStandardCols(offline.pdfAsset),
      }

      result.push(OfflineSchema.parse(parsed))
    }

    return result
  }
  private imgQuery(col: keyof DB["offline"]) {
    return (eb: ExpressionBuilder<DB, "offline">) =>
      jsonObjectFrom(
        eb
          .selectFrom("imageVariant")
          .select(["crop", "assetKey", "id", "createdAt"])
          .whereRef(`offline.${col}`, "=", "id")
          .select((eb2) => [
            jsonObjectFrom(
              eb2.selectFrom("asset").select(imageAssetCols).whereRef("imageVariant.assetKey", "=", "asset.key")
            ).as("asset"),
          ])
      )
  }

  private assetQuery(col: keyof DB["offline"]) {
    return (eb: ExpressionBuilder<DB, "offline">) =>
      jsonObjectFrom(eb.selectFrom("asset").select(fileAssetCols).whereRef(`offline.${col}`, "=", "asset.key"))
  }
}
