import type { Database } from "@dotkomonline/db"
import type { StaticAsset, StaticAssetId, StaticAssetWrite } from "@dotkomonline/types"
import type { Kysely } from "kysely"

export interface StaticAssetRepository {
  create(values: StaticAssetWrite): Promise<StaticAsset>
  delete(id: string): Promise<void>
  get(id: string): Promise<StaticAsset>
}

export class StaticAssetRepositoryImpl implements StaticAssetRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(data: StaticAssetWrite): Promise<StaticAsset> {
    const staticAsset = await this.db.insertInto("staticAsset").values(data).returningAll().executeTakeFirstOrThrow()
    return staticAsset
  }

  async delete(id: StaticAssetId): Promise<void> {
    await this.db.deleteFrom("staticAsset").where("id", "=", id).execute()
  }

  async get(id: StaticAssetId): Promise<StaticAsset> {
    return this.db.selectFrom("staticAsset").selectAll().where("id", "=", id).executeTakeFirstOrThrow()
  }
}
