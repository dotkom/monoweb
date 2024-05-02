import type { Database } from "@dotkomonline/db"
import { type Offline, type OfflineId, OfflineSchema, type OfflineWrite, type StaticAsset } from "@dotkomonline/types"
import { type Kysely, sql } from "kysely"
import { type Cursor, jsonBuildObject, orderedQuery } from "../../utils/db-utils"

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
    .leftJoin("staticAsset as file", "offline.fileId", "file.id")
    .select(sql<StaticAsset>`${jsonBuildObject<StaticAsset>({
      id: "file.id",
      url: "file.url",
      fileName: "file.fileName",
      createdAt: "file.createdAt",
      fileType: "file.fileType",
    })}`.as("file"))
    .leftJoin("staticAsset as image", "offline.imageId", "image.id")
    .select(sql<StaticAsset>`${jsonBuildObject<StaticAsset>({
      id: "image.id",
      url: "image.url",
      fileName: "image.fileName",
      createdAt: "image.createdAt",
      fileType: "image.fileType",
    })}`.as("image"))
    .where("offline.id", "=", id)
    
    const result = query.execute()
    
    return result ? mapToOffline(result) : undefined
  }

  async getAll(take: number, cursor?: Cursor): Promise<Offline[]> {
    const getStaticAssetJsonQuery = (alias: string) => {
      
      const res =  sql<StaticAsset>`${jsonBuildObject<StaticAsset>({
      id: `${alias}.id`,
      url: `${alias}.url`,
      fileName: `${alias}.fileName`,
      createdAt: `${alias}.createdAt`,
      fileType: `${alias}.fileType`,
    })}`.as(alias)
    console.log(res)
    return res
  }

    const query = this.db
      .selectFrom("offline")
      .selectAll("offline")
      .leftJoin("staticAsset as file", "offline.fileId", "file.id")
      .select(getStaticAssetJsonQuery("file"))
      .leftJoin("staticAsset as image", "offline.imageId", "image.id")
      .select(getStaticAssetJsonQuery("image"))
      .orderBy("offline.createdAt", "desc")
      .limit(take)


    const ordered = orderedQuery(query, cursor)
    const offlines = await ordered.execute()
    console.log(offlines)
    return offlines.map(mapToOffline)
  }
}
