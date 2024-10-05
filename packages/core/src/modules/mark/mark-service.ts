import type { Mark, MarkId, MarkWrite } from "@dotkomonline/types"
import type { Cursor } from "../../query"
import { MarkNotFoundError } from "./mark-error"
import type { MarkRepository } from "./mark-repository"

export interface MarkService {
  getMark(id: MarkId): Promise<Mark>
  getMarks(limit: number, cursor?: Cursor): Promise<Mark[]>
  createMark(payload: MarkWrite): Promise<Mark>
  updateMark(id: MarkId, payload: MarkWrite): Promise<Mark>
  deleteMark(id: MarkId): Promise<Mark>
}

export class MarkServiceImpl implements MarkService {
  constructor(private readonly markRepository: MarkRepository) {}

  /**
   * Get a mark by its id
   *
   * @throws {MarkNotFoundError} if the mark does not exist
   */
  async getMark(id: MarkId): Promise<Mark> {
    const mark = await this.markRepository.getById(id)
    if (!mark) {
      throw new MarkNotFoundError(id)
    }
    return mark
  }

  async getMarks(limit: number, cursor?: Cursor): Promise<Mark[]> {
    const marks = await this.markRepository.getAll(limit, cursor)
    return marks
  }

  async createMark(payload: MarkWrite): Promise<Mark> {
    const mark = await this.markRepository.create(payload)
    return mark
  }

  /**
   * Update a mark by its id
   *
   * @throws {MarkNotFoundError} if the mark does not exist
   */
  async updateMark(id: MarkId, payload: MarkWrite): Promise<Mark> {
    const mark = await this.markRepository.update(id, payload)
    if (!mark) {
      throw new MarkNotFoundError(id)
    }
    return mark
  }

  /**
   * Delete a mark by its id
   *
   * @throws {MarkNotFoundError} if the mark does not exist
   */
  async deleteMark(id: MarkId): Promise<Mark> {
    const mark = await this.markRepository.delete(id)
    if (!mark) {
      throw new MarkNotFoundError(id)
    }
    return mark
  }
}
