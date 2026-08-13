import type { Prisma, DBHandle } from "@dotkomonline/db"
import { parseOrReport } from "../../invariant"
import { type Feature, FeatureSchema, type FeatureWrite } from "./feature"

export interface FeatureRepository {
  findMany(handle: DBHandle): Promise<Feature[]>
  findActive(handle: DBHandle, now: Date): Promise<Feature[]>
  update(handle: DBHandle, data: FeatureWrite): Promise<Feature>
}

export function getFeatureRepository(): FeatureRepository {
  return {
    async findMany(handle) {
      const features = await handle.feature.findMany({ orderBy: { key: "asc" } })
      return parseOrReport(FeatureSchema.array(), features)
    },

    async findActive(handle, now) {
      const features = await handle.feature.findMany({
        where: {
          enabled: true,
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
            { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
          ],
        },
        orderBy: { key: "asc" },
      })
      return parseOrReport(FeatureSchema.array(), features)
    },

    async update(handle, data) {
      const { key, configuration, ...values } = data
      const feature = await handle.feature.upsert({
        where: { key },
        create: { key, ...values, configuration: configuration as Prisma.InputJsonValue },
        update: { ...values, configuration: configuration as Prisma.InputJsonValue },
      })
      return parseOrReport(FeatureSchema, feature)
    },
  }
}
