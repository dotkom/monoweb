import type { DBClient } from "@dotkomonline/db"
import type { Offline, OfflineId, OfflineWrite } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface OfflineRepository {
  getById(id: OfflineId): Promise<Offline | null>
  getAll(page: Pageable): Promise<Offline[]>
  create(values: OfflineWrite): Promise<Offline>
  update(id: OfflineId, data: Partial<OfflineWrite>): Promise<Offline>
}

export class OfflineRepositoryImpl implements OfflineRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  async create(data: OfflineWrite): Promise<Offline> {
    return await this.db.offline.create({ data })
  }

  async update(id: OfflineId, data: Partial<OfflineWrite>): Promise<Offline> {
    return await this.db.offline.update({ where: { id }, data })
  }

  async getById(id: string): Promise<Offline | null> {
    return await this.db.offline.findUnique({ where: { id } })
  }

  async getAll(page: Pageable): Promise<Offline[]> {
    return await this.db.offline.findMany({ ...pageQuery(page), orderBy: { published: "desc" } })
  }
}
