import type { DBHandle } from "@dotkomonline/db"
import { type Offline, type OfflineId, OfflineSchema, type OfflineWrite } from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"
import { type Pageable, pageQuery } from "../../query"

export interface OfflineRepository {
  create(handle: DBHandle, data: OfflineWrite): Promise<Offline>
  update(handle: DBHandle, offlineId: OfflineId, data: Partial<OfflineWrite>): Promise<Offline>
  findById(handle: DBHandle, offlineId: OfflineId): Promise<Offline | null>
  findMany(handle: DBHandle, page: Pageable): Promise<Offline[]>
}

export function getOfflineRepository(): OfflineRepository {
  return {
    async create(handle, data) {
      const offline = await handle.offline.create({ data })

      return parseOrReport(OfflineSchema, offline)
    },

    async update(handle, offlineId, data) {
      const offline = await handle.offline.update({
        where: {
          id: offlineId,
        },
        data,
      })

      return parseOrReport(OfflineSchema, offline)
    },

    async findById(handle, offlineId) {
      const offline = await handle.offline.findUnique({
        where: {
          id: offlineId,
        },
      })

      return parseOrReport(OfflineSchema.nullable(), offline)
    },

    async findMany(handle, page) {
      const offlines = await handle.offline.findMany({
        ...pageQuery(page),
        orderBy: {
          publishedAt: "desc",
        },
      })

      return parseOrReport(OfflineSchema.array(), offlines)
    },
  }
}
