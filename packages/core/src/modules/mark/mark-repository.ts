import type { DBHandle } from "@dotkomonline/db"
import type { Mark, MarkId, MarkWrite } from "@dotkomonline/types"
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
      return await handle.mark.findUnique({ where: { id: markId } })
    },
    async getAll(handle, page) {
      return await handle.mark.findMany({ ...pageQuery(page) })
    },
    async create(handle, data) {
      return await handle.mark.create({ data })
    },
    async update(handle, markId, data) {
      return await handle.mark.update({ where: { id: markId }, data })
    },
    async delete(handle, markId) {
      return await handle.mark.delete({ where: { id: markId } })
    },
  }
}
