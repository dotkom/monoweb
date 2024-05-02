import type { Database } from "@dotkomonline/db"
import { OfflineSchema, type Offline, type OfflineId, type OfflineWrite, type StaticAsset } from "@dotkomonline/types"
import { type Kysely, sql } from "kysely"
import { type Cursor, orderedQuery } from "../../utils/db-utils"

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

  private async baseQuery() {
    return this.db

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
    ])
    .leftJoin("staticAsset as file", "offline.fileId", "file.id")
    .select(sql<StaticAsset>`json_build_object(
      'fileType', file.file_type,
      'fileName', file.file_name,
      'id', file.id,
      'updatedAt', file.updated_at,
      'url', file.url
      )`.as("file"))
    .leftJoin("staticAsset as image", "offline.imageId", "image.id")
    .select(sql<StaticAsset>`json_build_object(
      'fileType', image.file_type,
      'fileName', image.file_name,
      'id', image.id,
      'updatedAt', image.updated_at,
      'url', image.url
      )`.as("image"))
    .where("offline.id", "=", id)

    
    const result = await query.executeTakeFirst()

    if(!result) {
      return null
    }
    
    return OfflineSchema.parse({
      ...result,
      file: result.file.id ? result.file : null,
      image: result.image.id ? result.image : null,
    })
  }

  async getAll(take: number, cursor?: Cursor): Promise<Offline[]> {
    const query = this.db
      .selectFrom("offline")
      .selectAll("offline")
      .leftJoin("staticAsset as file", "offline.fileId", "file.id")
      .select(sql<StaticAsset>`json_build_object(
        'createdAt', file.created_at,
        'fileType', file.file_type,
        'fileName', file.file_name,
        'id', file.id,
        'updatedAt', file.updated_at,
        'url', file.url
        )`.as("file"))
      .leftJoin("staticAsset as image", "offline.imageId", "image.id")
      .select(sql<StaticAsset>`json_build_object(
        'createdAt', image.created_at,
        'fileType', image.file_type,
        'fileName', image.file_name,
        'id', image.id,
        'updatedAt', image.updated_at,
        'url', image.url
        )`.as("image"))
      .orderBy("offline.createdAt", "desc")
      .limit(take)


    const ordered = orderedQuery(query, cursor)
    const offlines = await ordered.execute()
    return offlines.map(offline => OfflineSchema.parse({
      ...offline,
      file: offline.file.id ? offline.file : null,
      image: offline.image.id ? offline.image : null,
    }))
  }
}
