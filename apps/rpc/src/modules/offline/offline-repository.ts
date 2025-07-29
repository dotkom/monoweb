import type { DBHandle } from "@dotkomonline/db"
import { type Offline, type OfflineId, OfflineSchema, type OfflineWrite } from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"
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
      const offline = await handle.offline.findUnique({ where: { id: offlineId } })
      return parseOrReport(OfflineSchema, offline)
    },
    async getAll(handle, page) {
      const offlines = await handle.offline.findMany({ ...pageQuery(page), orderBy: { publishedAt: "desc" } })
      return offlines.map((offline) => parseOrReport(OfflineSchema, offline))
    },
    async create(handle, data) {
      const offline = await handle.offline.create({ data })
      return parseOrReport(OfflineSchema, offline)
    },
    async update(handle, offlineId, data) {
      const offline = await handle.offline.update({ where: { id: offlineId }, data })
      return parseOrReport(OfflineSchema, offline)
    },
  }
}
