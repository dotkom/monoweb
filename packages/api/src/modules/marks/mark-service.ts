import { NotFoundError } from "../../errors/errors"
import { MarkWrite, Mark } from "@dotkomonline/types"
import { MarkRepository } from "./mark-repository"

export interface MarkService {
  getMark: (id: string) => Promise<Mark>
  getMarks: (limit: number) => Promise<Mark[]>
  createMark: (payload: MarkWrite) => Promise<Mark>
  updateMark: (id: string, payload: MarkWrite) => Promise<Mark>
  deleteMark: (id: string) => Promise<Mark>
}

export const initMarkService = (markRepository: MarkRepository): MarkService => {
  const service = {
    getMark: async (id: string) => {
      const mark = await markRepository.getMarkByID(id)
      if (!mark) throw new NotFoundError(`Mark with ID:${id} not found`)
      return mark
    },
    getMarks: async (limit: number) => {
      const marks = await markRepository.getMarks(limit)
      return marks
    },
    createMark: async (payload: MarkWrite) => {
      const mark = await markRepository.createMark(payload)
      if (!mark) throw new NotFoundError(`Mark could not be created`)
      return mark
    },
    updateMark: async (id: string, payload: MarkWrite) => {
      const mark = await markRepository.updateMark(id, payload)
      if (!mark) throw new NotFoundError(`Mark with ID:${id} not found`)
      return mark
    },
    deleteMark: async (id: string) => {
      const mark = await service.getMark(id)
      if (!mark) throw new NotFoundError(`Mark with ID:${id} not found`)
      const removedMark = await markRepository.deleteMark(id)
      if (!removedMark) throw new NotFoundError(`Could not delete mark with ID:${id}`)
      return removedMark
    },
  }
  return service
}
