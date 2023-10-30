import { Database } from "@dotkomonline/db"
import { Offline, OfflineId, OfflineSchema } from "@dotkomonline/types"
import { Insertable, Kysely, Selectable } from "kysely"
import { Cursor, orderedQuery } from "../../utils/db-utils"

type OfflineWrite = Insertable<Database["offline"]>

export interface OfflineRepository {
  getById(id: OfflineId): Promise<Offline | undefined>
  getAll(take: number, cursor?: Cursor): Promise<Offline[]>
  create(values: OfflineWrite): Promise<Offline>
  update(id: OfflineId, data: OfflineWrite): Promise<Offline>
}

const mapToOffline = (offline: Selectable<Database["offline"]>): Offline => {
  return OfflineSchema.parse(offline)
}

export class OfflineRepositoryImpl implements OfflineRepository {
  constructor(private readonly db: Kysely<Database>) {}

  private baseOfflineQuery() {
    return this.db.selectFrom("offline").selectAll("offline")
  }

  async create(data: OfflineWrite): Promise<Offline> {
    const offline = await this.db.insertInto("offline").values(data).returningAll().executeTakeFirstOrThrow()
    return offline
  }

  async update(id: OfflineId, data: OfflineWrite): Promise<Offline> {
    await this.db.updateTable("offline").set(data).where("id", "=", id).execute()
    return this.getById(id)
  }

  async getById(id: string): Promise<Offline> {
    const offline = await this.baseOfflineQuery().where("offline.id", "=", id).executeTakeFirstOrThrow()
    return mapToOffline(offline)
  }

  async getAll(take: number, cursor?: Cursor): Promise<Offline[]> {
    const ordered = orderedQuery(this.baseOfflineQuery().limit(take), cursor)
    const offlines = await ordered.execute()
    return offlines.map(mapToOffline)
  }
}
