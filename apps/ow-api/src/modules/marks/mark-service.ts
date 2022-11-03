import { NotFoundError } from "../../errors/errors"
import { InsertMark, Mark } from "./mark"
import { MarkRepository } from "./mark-repository"
import { PersonalMark } from "./personal-mark"
import { PersonalMarkRepository } from "./personal-mark-repository"

export interface MarkService {
  getMark: (id: string) => Promise<Mark>
  getMarks: (limit: number) => Promise<Mark[]>
  createMark: (payload: InsertMark) => Promise<Mark>
  updateMark: (id: string, payload: InsertMark) => Promise<Mark>
  removeMarkFromUser: (userId: string, markId: string) => Promise<[Mark, PersonalMark]>
  addMarkToUser: (userId: string, markId: string) => Promise<[Mark, PersonalMark]>
  deleteMark: (id: string) => Promise<Mark | undefined>
}

export const initMarkService = (
  markRepository: MarkRepository,
  personalMarkRepository: PersonalMarkRepository
): MarkService => {
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
    createMark: async (payload: InsertMark) => {
      const mark = await markRepository.createMark(payload)
      return mark
    },
    updateMark: async (id: string, payload: InsertMark) => {
      const mark = await markRepository.updateMark(id, payload)
      return mark
    },
    removeMarkFromUser: async (userId: string, markId: string) => {
      const mark = await service.getMark(markId)
      if (userId in mark.given_to) {
        mark.given_to = mark.given_to.filter((id: string) => id !== userId)
        const markInfo = await Promise.all([
          markRepository.updateMark(markId, mark),
          personalMarkRepository.removePersonalMark(userId, markId),
        ])
        return markInfo
      }
      throw new NotFoundError(`User with ID:${userId} does not have mark with ID:${markId}`)
    },
    addMarkToUser: async (userId: string, markId: string) => {
      const mark = await service.getMark(markId)
      if (!mark) throw new NotFoundError(`Mark with ID:${markId} not found`)
      if (!(userId in mark.given_to)) {
        mark.given_to.push(userId)
        const markInfo = await Promise.all([
          service.updateMark(markId, mark),
          personalMarkRepository.addPersonalMarkToUser(userId, markId),
        ])
        return markInfo
      }
      throw new Error(`User with ID:${userId} already has mark with ID:${markId}`)
    },
    deleteMark: async (id: string) => {
      const mark = await service.getMark(id)
      if (!mark) throw new NotFoundError(`Mark with ID:${id} not found`)
      mark.given_to.forEach(async (userId) => {
        await service.removeMarkFromUser(userId, id)
      })
      const removedMark = await markRepository.deleteMark(id)
      return removedMark
    },
  }
  return service
}
