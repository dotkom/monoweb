import type { DBHandle } from "@dotkomonline/db"
import type { Offline, OfflineId, OfflineWrite } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface OfflineRepository {
  getById(handle: DBHandle, offlineId: OfflineId): Promise<Offline | null>
  getAll(handle: DBHandle, page: Pageable): Promise<Offline[]>
  create(handle: DBHandle, data: OfflineWrite): Promise<Offline>
  update(handle: DBHandle, offlineId: OfflineId, data: Partial<OfflineWrite>): Promise<Offline>
}

export function getOfflineRepository(): OfflineRepository {
  return {
    async getById(handle, offlineId) {
      return await handle.offline.findUnique({ where: { id: offlineId } })
    },
    async getAll(handle, page) {
      return await handle.offline.findMany({ ...pageQuery(page), orderBy: { published: "desc" } })
    },
    async create(handle, data) {
      return await handle.offline.create({ data })
    },
    async update(handle, offlineId, data) {
      return await handle.offline.update({ where: { id: offlineId }, data })
    },
  }
}
