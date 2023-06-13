import { Mark, MarkWrite } from "@dotkomonline/types"

import { Cursor } from "../../utils/db-utils"
import { MarkRepository } from "./mark-repository"
import { NotFoundError } from "../../errors/errors"

export interface MarkService {
  getMark(id: string): Promise<Mark>
  getMarks(limit: number, cursor?: Cursor): Promise<Mark[]>
  createMark(payload: MarkWrite): Promise<Mark>
  updateMark(id: string, payload: MarkWrite): Promise<Mark>
  deleteMark(id: string): Promise<Mark>
}

export class MarkServiceImpl implements MarkService {
  constructor(private readonly markRepository: MarkRepository) {}

  async getMark(id: string): Promise<Mark> {
    const mark = await this.markRepository.getById(id)
    if (!mark) throw new NotFoundError(`Mark with ID:${id} not found`)
    return mark
  }

  async getMarks(limit: number, cursor?: Cursor): Promise<Mark[]> {
    const marks = await this.markRepository.getAll(limit, cursor)
    return marks
  }

  async createMark(payload: MarkWrite): Promise<Mark> {
    const mark = await this.markRepository.create(payload)
    if (!mark) throw new NotFoundError(`Mark could not be created`)
    return mark
  }

  async updateMark(id: string, payload: MarkWrite): Promise<Mark> {
    const mark = await this.markRepository.update(id, payload)
    if (!mark) throw new NotFoundError(`Mark with ID:${id} not found`)
    return mark
  }

  async deleteMark(id: string): Promise<Mark> {
    const mark = await this.markRepository.delete(id)
    if (!mark) throw new NotFoundError(`Mark with ID:${id} not found`)
    return mark
  }
}
