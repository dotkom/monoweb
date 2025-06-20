import type { DBClient } from "@dotkomonline/db"
import type { Offline, OfflineId, OfflineWrite } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface OfflineRepository {
  getById(offlineId: OfflineId): Promise<Offline | null>
  getAll(page: Pageable): Promise<Offline[]>
  create(data: OfflineWrite): Promise<Offline>
  update(offlineId: OfflineId, data: Partial<OfflineWrite>): Promise<Offline>
}

export class OfflineRepositoryImpl implements OfflineRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  async create(data: OfflineWrite) {
    return await this.db.offline.create({ data })
  }

  async update(offlineId: OfflineId, data: Partial<OfflineWrite>) {
    return await this.db.offline.update({ where: { id: offlineId }, data })
  }

  async getById(offlineId: string) {
    return await this.db.offline.findUnique({ where: { id: offlineId } })
  }

  async getAll(page: Pageable) {
    return await this.db.offline.findMany({ ...pageQuery(page), orderBy: { published: "desc" } })
  }
}
