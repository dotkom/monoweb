import { NotFoundError } from "../../errors/errors"
import { InsertMark, Mark } from "./mark"
import { MarkRepository } from "./mark-repository"

export interface MarkService {
  getMark: (id: Mark["id"]) => Promise<Mark>
  getMarks: (limit: number) => Promise<Mark[]>
  register: (payload: InsertMark) => Promise<Mark>
}

export const initMarkService = (markRepository: MarkRepository): MarkService => ({
  getMark: async (id) => {
    const mark = await markRepository.getMarkByID(id)
    if (!mark) throw new NotFoundError(`Mark with ID:${id} not found`)
    return mark
  },
  getMarks: async (limit) => {
    const marks = await markRepository.getMarks(limit)
    return marks
  },
  register: async (payload) => {
    const mark = await markRepository.createMark(payload)
    return mark
  },
})
