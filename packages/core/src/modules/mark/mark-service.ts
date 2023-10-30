import { type Mark, type MarkId, type MarkWrite } from "@dotkomonline/types"
import { type MarkRepository } from "./mark-repository"
import { type Cursor } from "../../utils/db-utils"
import { NotFoundError } from "../../errors/errors"

export interface MarkService {
  getMark: (id: MarkId) => Promise<Mark>
  getMarks: (limit: number, cursor?: Cursor) => Promise<Mark[]>
  createMark: (payload: MarkWrite) => Promise<Mark>
  updateMark: (id: MarkId, payload: MarkWrite) => Promise<Mark>
  deleteMark: (id: MarkId) => Promise<Mark>
}

export class MarkServiceImpl implements MarkService {
  constructor(private readonly markRepository: MarkRepository) {}

  async getMark(id: MarkId): Promise<Mark> {
    const mark = await this.markRepository.getById(id)
    if (!mark) {
      throw new NotFoundError(`Mark with ID:${id} not found`)
    }
    return mark
  }

  async getMarks(limit: number, cursor?: Cursor): Promise<Mark[]> {
    const marks = await this.markRepository.getAll(limit, cursor)
    return marks
  }

  async createMark(payload: MarkWrite): Promise<Mark> {
    const mark = await this.markRepository.create(payload)
    if (!mark) {
      throw new NotFoundError(`Mark could not be created`)
    }
    return mark
  }

  async updateMark(id: MarkId, payload: MarkWrite): Promise<Mark> {
    const mark = await this.markRepository.update(id, payload)
    if (!mark) {
      throw new NotFoundError(`Mark with ID:${id} not found`)
    }
    return mark
  }

  async deleteMark(id: MarkId): Promise<Mark> {
    const mark = await this.markRepository.delete(id)
    if (!mark) {
      throw new NotFoundError(`Mark with ID:${id} not found`)
    }
    return mark
  }
}
