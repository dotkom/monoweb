import type { DBHandle } from "@dotkomonline/db"
import type { GroupId, Mark, MarkFilterQuery, MarkId, MarkWrite } from "@dotkomonline/types"
import { NotFoundError } from "../../error"
import type { Pageable } from "../../query"
import type { MarkRepository } from "./mark-repository"

export interface MarkService {
  /**
   * Get a mark by its id
   *
   * @throws {NotFoundError} if the mark does not exist
   */
  getMark(handle: DBHandle, markId: MarkId): Promise<Mark>
  findMany(handle: DBHandle, query: MarkFilterQuery): Promise<Mark[]>
  getMarks(handle: DBHandle, page: Pageable): Promise<Mark[]>
  createMark(handle: DBHandle, data: MarkWrite, groupIds: GroupId[]): Promise<Mark>
  /**
   * Update a mark by its id
   *
   * @throws {NotFoundError} if the mark does not exist
   */
  updateMark(handle: DBHandle, markId: MarkId, data: MarkWrite, groupIds: GroupId[]): Promise<Mark>
  /**
   * Delete a mark by its id
   *
   * @throws {NotFoundError} if the mark does not exist
   */
  deleteMark(handle: DBHandle, markId: MarkId): Promise<Mark>
}

export function getMarkService(markRepository: MarkRepository): MarkService {
  return {
    async getMark(handle, markId) {
      const mark = await markRepository.getById(handle, markId)
      if (!mark) {
        throw new NotFoundError(`Mark(ID=${markId}) not found`)
      }
      return mark
    },
    async findMany(handle, query) {
      return await markRepository.findMany(handle, query)
    },
    async getMarks(handle, page) {
      return await markRepository.getAll(handle, page)
    },
    async createMark(handle, data, groupIds) {
      return await markRepository.create(handle, data, groupIds)
    },
    async updateMark(handle, markId, data, groupIds) {
      return await markRepository.update(handle, markId, data, groupIds)
    },
    async deleteMark(handle, markId) {
      return await markRepository.delete(handle, markId)
    },
  }
}
