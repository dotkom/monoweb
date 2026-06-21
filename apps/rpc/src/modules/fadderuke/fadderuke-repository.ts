import type { DBHandle } from "@dotkomonline/db"
import { parseOrReport } from "../../invariant"
import { type Fadderuke, type FadderukeId, FadderukeSchema, type FadderukeWrite } from "./fadderuke"

export interface FadderukeRepository {
  create(handle: DBHandle, data: FadderukeWrite): Promise<Fadderuke>
  update(handle: DBHandle, fadderukeId: FadderukeId, data: Partial<FadderukeWrite>): Promise<Fadderuke>
  delete(handle: DBHandle, fadderukeId: FadderukeId): Promise<void>
  findById(handle: DBHandle, fadderukeId: FadderukeId): Promise<Fadderuke | null>
  findByYear(handle: DBHandle, year: number): Promise<Fadderuke | null>
  findMany(handle: DBHandle): Promise<Fadderuke[]>
}

export function getFadderukeRepository(): FadderukeRepository {
  return {
    async create(handle, data) {
      const fadderuke = await handle.fadderuke.create({ data })

      return parseOrReport(FadderukeSchema, fadderuke)
    },

    async update(handle, fadderukeId, data) {
      const fadderuke = await handle.fadderuke.update({
        where: {
          id: fadderukeId,
        },
        data,
      })

      return parseOrReport(FadderukeSchema, fadderuke)
    },

    async delete(handle, fadderukeId) {
      await handle.fadderuke.delete({
        where: {
          id: fadderukeId,
        },
      })
    },

    async findById(handle, fadderukeId) {
      const fadderuke = await handle.fadderuke.findUnique({
        where: {
          id: fadderukeId,
        },
      })

      return parseOrReport(FadderukeSchema.nullable(), fadderuke)
    },

    async findByYear(handle, year) {
      const fadderuke = await handle.fadderuke.findUnique({
        where: { year },
      })

      return parseOrReport(FadderukeSchema.nullable(), fadderuke)
    },

    async findMany(handle) {
      const fadderuker = await handle.fadderuke.findMany({
        orderBy: {
          year: "desc",
        },
      })

      return parseOrReport(FadderukeSchema.array(), fadderuker)
    },
  }
}
