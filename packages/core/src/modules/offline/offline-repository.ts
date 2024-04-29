import type { Database } from "@dotkomonline/db"
import { type Offline, type OfflineId, OfflineSchema, type OfflineWrite, type StaticAsset } from "@dotkomonline/types"
import { type Kysely, sql } from "kysely"
import { type Cursor, orderedQuery } from "../../utils/db-utils"

export interface OfflineRepository {
  getById(id: OfflineId): Promise<Offline | undefined>
  getAll(take: number, cursor?: Cursor): Promise<Offline[]>
  create(values: OfflineWrite): Promise<Offline>
  update(id: OfflineId, data: Partial<OfflineWrite>): Promise<Offline>
}

const mapToOffline = (offline: unknown): Offline => OfflineSchema.parse(offline)

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

  private async baseQuery() {
    return this.db

  }

  async getById(id: string): Promise<Offline | undefined> {
    const query = this.db
    .selectFrom("offline")
    .selectAll("offline")
    .leftJoin("staticAsset", "offline.fileId", "staticAsset.id")
    .select(sql<StaticAsset>`json_build_object('id', static_asset.id, 'url', static_asset.url)`.as("file"))
    .leftJoin("staticAsset", "offline.imageId", "staticAsset.id")
    .select(sql<StaticAsset>`json_build_object('id', static_asset.id, 'url', static_asset.url)`.as("image"))
    .where("offline.id", "=", id)
    
    const result = query.execute()
    
    return result ? mapToOffline(result) : undefined
  }

  async getAll(take: number, cursor?: Cursor): Promise<Offline[]> {
    const query = this.db
      .selectFrom("offline")
      .selectAll("offline")
      .leftJoin("staticAsset", "offline.fileId", "staticAsset.id")
      .select(sql<StaticAsset>`json_build_object('id', static_asset.id, 'url', static_asset.url)`.as("file"))
      .leftJoin("staticAsset", "offline.imageId", "staticAsset.id")
      .select(sql<StaticAsset>`json_build_object('id', static_asset.id, 'url', static_asset.url)`.as("image"))
      .orderBy("offline.createdAt", "desc")
      .limit(take)

    const ordered = orderedQuery(query, cursor)
    const offlines = await ordered.execute()
    return offlines.map(mapToOffline)
  }
}
