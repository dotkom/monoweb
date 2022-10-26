import { NotFoundError } from "../../errors/errors"
import { InsertPersonalMark, PersonalMark } from "./personal-mark"
import { PersonalMarkRepository } from "./personal-mark-repository"

export interface PersonalMarkService {
  getPersonalMarksForUser: (userId: string) => Promise<PersonalMark[]>
  addPersonalMarkToUser: (userId: string, markId: string) => Promise<PersonalMark>
  removePersonalMark: (userId: string, markId: string) => Promise<PersonalMark>
}

export const initPersonalMarkService = (personalMarkRepository: PersonalMarkRepository): PersonalMarkService => ({
  getPersonalMarksForUser: async (userId: string) => {
    const personalMarks = await personalMarkRepository.getPersonalMarksForUser(userId)
    if (!personalMarks) throw new NotFoundError(`PersonalMark for user with ID:${userId} not found`)
    return personalMarks
  },
  addPersonalMarkToUser: async (userId: string, markId: string) => {
    const personalMark = await personalMarkRepository.addPersonalMarkToUser(userId, markId)
    return personalMark
  },
  removePersonalMark: async (userId: string, markId: string) => {
    const personalMark = await personalMarkRepository.removePersonalMark(userId, markId)
    return personalMark
  },
})
