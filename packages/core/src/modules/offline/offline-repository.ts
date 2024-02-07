import { type Database } from "@dotkomonline/db"
import { OfflineSchema, type Offline, type OfflineId, type OfflineWrite } from "@dotkomonline/types"
import { type Kysely } from "kysely"
import { orderedQuery, type Cursor } from "../../utils/db-utils"

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
    return offline
  }

  async update(id: OfflineId, data: Partial<OfflineWrite>): Promise<Offline> {
    const result = await this.db
      .updateTable("offline")
      .set({ ...data, updatedAt: new Date() })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()
    return result
  }

  async getById(id: string): Promise<Offline | undefined> {
    const offline = await this.db.selectFrom("offline").selectAll().where("offline.id", "=", id).executeTakeFirst()
    return offline ? mapToOffline(offline) : undefined
  }

  async getAll(take: number, cursor?: Cursor): Promise<Offline[]> {
    const query = this.db.selectFrom("offline").selectAll().limit(take)
    const ordered = orderedQuery(query, cursor)
    const offlines = await ordered.execute()
    return offlines.map(mapToOffline)
  }
}
