import type { DBClient } from "@dotkomonline/db"
import type { Offline, OfflineId, OfflineWrite } from "@dotkomonline/types"

export interface OfflineRepository {
  getById(id: OfflineId): Promise<Offline | null>
  getAll(take: number): Promise<Offline[]>
  create(values: OfflineWrite): Promise<Offline>
  update(id: OfflineId, data: Partial<OfflineWrite>): Promise<Offline>
}

export class OfflineRepositoryImpl implements OfflineRepository {
  constructor(private readonly db: DBClient) {}

  async create(data: OfflineWrite): Promise<Offline> {
    return await this.db.offline.create({ data })
  }

  async update(id: OfflineId, data: Partial<OfflineWrite>): Promise<Offline> {
    return await this.db.offline.update({ where: { id }, data })
  }

  async getById(id: string): Promise<Offline | null> {
    return await this.db.offline.findUnique({ where: { id } })
  }

  async getAll(take: number): Promise<Offline[]> {
    return await this.db.offline.findMany({ take })
  }
}
