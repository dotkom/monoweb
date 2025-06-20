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
  getMark(markId: MarkId): Promise<Mark>
  getMarks(page: Pageable): Promise<Mark[]>
  createMark(data: MarkWrite): Promise<Mark>
  /**
   * Update a mark by its id
   *
   * @throws {MarkNotFoundError} if the mark does not exist
   */
  updateMark(markId: MarkId, data: MarkWrite): Promise<Mark>
  /**
   * Delete a mark by its id
   *
   * @throws {MarkNotFoundError} if the mark does not exist
   */
  deleteMark(markId: MarkId): Promise<Mark>
}

export class MarkServiceImpl implements MarkService {
  private readonly markRepository: MarkRepository

  constructor(markRepository: MarkRepository) {
    this.markRepository = markRepository
  }

  public async getMark(markId: MarkId) {
    const mark = await this.markRepository.getById(markId)
    if (!mark) {
      throw new MarkNotFoundError(markId)
    }
    return mark
  }

  public async getMarks(page: Pageable) {
    const marks = await this.markRepository.getAll(page)
    return marks
  }

  public async createMark(data: MarkWrite) {
    const mark = await this.markRepository.create(data)
    return mark
  }

  public async updateMark(markId: MarkId, data: MarkWrite) {
    const mark = await this.markRepository.update(markId, data)
    return mark
  }

  public async deleteMark(markId: MarkId) {
    const mark = await this.markRepository.delete(markId)
    return mark
  }
}
