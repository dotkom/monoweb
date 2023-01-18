import { NotFoundError } from "../../errors/errors"
import { MarkWrite, Mark, PersonalMark } from "@dotkomonline/types"
import { MarkRepository } from "./mark-repository"
import { PersonalMarkRepository } from "./personal-mark-repository"

export interface MarkService {
  getMark: (id: string) => Promise<Mark>
  getMarks: (limit: number) => Promise<Mark[]>
  createMark: (payload: MarkWrite) => Promise<Mark>
  updateMark: (id: string, payload: MarkWrite) => Promise<Mark>
  removeMarkFromUser: (userId: string, markId: string) => Promise<(PersonalMark | Mark)[]>
  addMarkToUser: (userId: string, markId: string) => Promise<(PersonalMark | Mark)[]>
  deleteMark: (id: string) => Promise<Mark>
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
    removeMarkFromUser: async (userId: string, markId: string) => {
      const mark = await service.getMark(markId)
      if (!mark) throw new NotFoundError(`Mark with ID:${markId} not found`)
      const personalMark = await personalMarkRepository.getPersonalMark(userId, markId)
      if (!personalMark) throw new NotFoundError(`Personal mark with mark ID:${markId} and user ID:${userId} not found`)
      const removedPersonalMark = await personalMarkRepository.removePersonalMark(userId, markId)
      if (!removedPersonalMark)
        throw new NotFoundError(`Could not remove personal mark with mark ID:${markId} and user ID:${userId}`)
      return [mark, removedPersonalMark]
    },
    addMarkToUser: async (userId: string, markId: string) => {
      const mark = await service.getMark(markId)
      if (!mark) throw new NotFoundError(`Mark with ID:${markId} not found`)
      const personalMark = await personalMarkRepository.getPersonalMark(userId, markId)
      if (personalMark)
        throw new NotFoundError(`Personal mark with mark ID:${markId} and user ID:${userId} already exists`)
      const createdPersonalMark = await personalMarkRepository.addPersonalMarkToUser(userId, markId)
      if (!createdPersonalMark)
        throw new NotFoundError(`Could not add personal mark with ID:${markId} and user ID ${userId}`)
      return [mark, createdPersonalMark]
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
