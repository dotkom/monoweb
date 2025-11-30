import type { DBHandle } from "@dotkomonline/db"
import type { GroupId, Mark, MarkFilterQuery, MarkId, MarkWrite } from "@dotkomonline/types"
import { NotFoundError } from "../../error"
import type { Pageable } from "../../query"
import type { MarkRepository } from "./mark-repository"

export interface MarkService {
  create(handle: DBHandle, markData: MarkWrite, groupIdsData: GroupId[]): Promise<Mark>
  /**
   * Update a mark by its id
   *
   * @throws {NotFoundError} if the mark does not exist
   */
  update(handle: DBHandle, markId: MarkId, markData: MarkWrite, groupIdsData: GroupId[]): Promise<Mark>
  /**
   * Delete a mark by its id
   *
   * @throws {NotFoundError} if the mark does not exist
   */
  delete(handle: DBHandle, markId: MarkId): Promise<Mark>
  /**
   * Get a mark by its id
   *
   * @throws {NotFoundError} if the mark does not exist
   */
  getById(handle: DBHandle, markId: MarkId): Promise<Mark>
  findMany(handle: DBHandle, query: MarkFilterQuery, page?: Pageable): Promise<Mark[]>
}

export function getMarkService(markRepository: MarkRepository): MarkService {
  return {
    async create(handle, markData, groupIdsData) {
      return await markRepository.create(handle, markData, groupIdsData)
    },

    async update(handle, markId, markData, groupIdsData) {
      return await markRepository.update(handle, markId, markData, groupIdsData)
    },

    async delete(handle, markId) {
      return await markRepository.delete(handle, markId)
    },

    async getById(handle, markId) {
      const mark = await markRepository.findById(handle, markId)
      if (!mark) {
        throw new NotFoundError(`Mark(ID=${markId}) not found`)
      }
      return mark
    },

    async findMany(handle, query, page) {
      return await markRepository.findMany(handle, query, page ?? { take: 20 })
    },
  }
}
