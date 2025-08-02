import type { DBHandle } from "@dotkomonline/db"
import type { Mark, MarkId, MarkWrite } from "@dotkomonline/types"
import type { Pageable } from "../../query"
import { MarkNotFoundError } from "./mark-error"
import type { MarkRepository } from "./mark-repository"

export interface MarkService {
  /**
   * Get a mark by its id
   *
   * @throws {MarkNotFoundError} if the mark does not exist
   */
  getMark(handle: DBHandle, markId: MarkId): Promise<Mark>
  getMany(handle: DBHandle, markIds: MarkId[]): Promise<Mark[]>
  getMarks(handle: DBHandle, page: Pageable): Promise<Mark[]>
  createMark(handle: DBHandle, data: MarkWrite): Promise<Mark>
  /**
   * Update a mark by its id
   *
   * @throws {MarkNotFoundError} if the mark does not exist
   */
  updateMark(handle: DBHandle, markId: MarkId, data: MarkWrite): Promise<Mark>
  /**
   * Delete a mark by its id
   *
   * @throws {MarkNotFoundError} if the mark does not exist
   */
  deleteMark(handle: DBHandle, markId: MarkId): Promise<Mark>
}

export function getMarkService(markRepository: MarkRepository): MarkService {
  return {
    async getMark(handle, markId) {
      const mark = await markRepository.getById(handle, markId)
      if (!mark) {
        throw new MarkNotFoundError(markId)
      }
      return mark
    },
    async getMany(handle, markIds) {
      return await markRepository.findMany(handle, markIds)
    },
    async getMarks(handle, page) {
      return await markRepository.getAll(handle, page)
    },
    async createMark(handle, data) {
      return await markRepository.create(handle, data)
    },
    async updateMark(handle, markId, data) {
      return await markRepository.update(handle, markId, data)
    },
    async deleteMark(handle, markId) {
      return await markRepository.delete(handle, markId)
    },
  }
}
