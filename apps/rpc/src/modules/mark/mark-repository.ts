import type { DBHandle } from "@dotkomonline/db"
import { type Mark, type MarkId, MarkSchema, type MarkWrite } from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"
import { type Pageable, pageQuery } from "../../query"

export interface MarkRepository {
  getById(handle: DBHandle, markId: MarkId): Promise<Mark | null>
  getAll(handle: DBHandle, page: Pageable): Promise<Mark[]>
  create(handle: DBHandle, data: MarkWrite): Promise<Mark>
  update(handle: DBHandle, markId: MarkId, data: MarkWrite): Promise<Mark>
  delete(handle: DBHandle, markId: MarkId): Promise<Mark>
}

export function getMarkRepository(): MarkRepository {
  return {
    async getById(handle, markId) {
      const mark = await handle.mark.findUnique({ where: { id: markId } })
      return parseOrReport(MarkSchema, mark)
    },
    async getAll(handle, page) {
      const marks = await handle.mark.findMany({ ...pageQuery(page) })
      return marks.map((mark) => parseOrReport(MarkSchema, mark))
    },
    async create(handle, data) {
      const mark = await handle.mark.create({ data })
      return parseOrReport(MarkSchema, mark)
    },
    async update(handle, markId, data) {
      const mark = await handle.mark.update({ where: { id: markId }, data })
      return parseOrReport(MarkSchema, mark)
    },
    async delete(handle, markId) {
      const mark = await handle.mark.delete({ where: { id: markId } })
      return parseOrReport(MarkSchema, mark)
    },
  }
}
