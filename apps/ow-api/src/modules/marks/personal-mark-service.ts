import { string } from "zod"
import { NotFoundError } from "../../errors/errors"
import { InsertPersonalMark, PersonalMark } from "./personal-mark"
import { PersonalMarkRepository } from "./personal-mark-repository"

export interface PersonalMarkService {
  getPersonalMarksForUser: (userId: string) => Promise<PersonalMark[]>
  getAllPersonalMarks: (limit: number) => Promise<PersonalMark[]>
  register: (payload: InsertPersonalMark) => Promise<PersonalMark>
}

export const initPersonalMarkService = (personalMarkRepository: PersonalMarkRepository): PersonalMarkService => ({
  getPersonalMarksForUser: async (userId: string) => {
    const personalMarks = await personalMarkRepository.getPersonalMarksForUser(userId)
    if (!personalMarks) throw new NotFoundError(`PersonalMark for user with ID:${userId} not found`)
    return personalMarks
  },
  getAllPersonalMarks: async (limit) => {
    const allPersonalMarks = await personalMarkRepository.getAllPersonalMarks(limit)
    return allPersonalMarks
  },
  register: async (payload) => {
    const personalMarks = await personalMarkRepository.createPersonalMark(payload)
    return personalMarks
  },
})
