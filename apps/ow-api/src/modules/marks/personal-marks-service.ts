import { NotFoundError } from "../../errors/errors"
import { InsertPersonalMarks, PersonalMarks } from "./personal-marks"
import { PersonalMarksRepository } from "./personal-marks-repository"

export interface PersonalMarksService {
  getPersonalMark: (id: PersonalMarks["id"]) => Promise<PersonalMarks>
  getPersonalMarks: (limit: number) => Promise<PersonalMarks[]>
  register: (payload: InsertPersonalMarks) => Promise<PersonalMarks>
}

export const initPersonalMarksService = (personalMarksRepository: PersonalMarksRepository): PersonalMarksService => ({
  getPersonalMark: async (id) => {
    const personalMarks = await personalMarksRepository.getPersonalMarkByID(id)
    if (!personalMarks) throw new NotFoundError(`PersonalMarks with ID:${id} not found`)
    return personalMarks
  },
  getPersonalMarks: async (limit) => {
    const personalMarks = await personalMarksRepository.getPersonalMarks(limit)
    return personalMarks
  },
  register: async (payload) => {
    const personalMarks = await personalMarksRepository.createPersonalMark(payload)
    return personalMarks
  },
})
