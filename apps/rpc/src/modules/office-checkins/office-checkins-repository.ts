import type { DBHandle } from "@dotkomonline/db"
import { parseOrReport } from "../../invariant"
import { type OfficeCheckin, OfficeCheckinSchema } from "./office-checkin"

export interface OfficeCheckinRepository {
  create(handle: DBHandle, time: Date, userRfid: string): Promise<OfficeCheckin>
  findByUserRfid(handle: DBHandle, userRfid: string): Promise<OfficeCheckin[]>
  findMany(handle: DBHandle): Promise<OfficeCheckin[]>
}

export function getOfficeCheckinRepository(): OfficeCheckinRepository {
  return {
    async create(handle, time, userRfid) {
      const checkin = await handle.officeCheckin.create({ data: { userRfid, time } })

      return parseOrReport(OfficeCheckinSchema, checkin)
    },

    async findByUserRfid(handle, userRfid) {
      const checkins = await handle.officeCheckin.findMany({
        where: { userRfid },
        orderBy: { time: "desc" },
      })

      return parseOrReport(OfficeCheckinSchema.array(), checkins)
    },

    async findMany(handle) {
      const checkins = await handle.officeCheckin.findMany({
        orderBy: { time: "desc" },
      })

      return parseOrReport(OfficeCheckinSchema.array(), checkins)
    },
  }
}
