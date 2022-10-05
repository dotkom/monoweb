import { NotFoundError } from "../../errors/errors"
import { InsertPersonalMarks, PersonalMarks } from "./personal-marks"
import { PersonalMarksRepository } from "./personal-marks-repository"

export interface PersonalMarksService {
  getPersonalMarks: (id: PersonalMarks["id"]) => Promise<PersonalMarks>
  getPersonalMarkss: (limit: number) => Promise<PersonalMarks[]>
  register: (payload: InsertPersonalMarks) => Promise<PersonalMarks>
}

export const initPersonalMarksService = (personalMarksRepository: PersonalMarksRepository): PersonalMarksService => ({
  getPersonalMarks: async (id) => {
    const personalMarks = await personalMarksRepository.getPersonalMarksByID(id)
    if (!personalMarks) throw new NotFoundError(`PersonalMarks with ID:${id} not found`)
    return personalMarks
  },
  getPersonalMarkss: async (limit) => {
    const personalMarkss = await personalMarksRepository.getPersonalMarkss(limit)
    return personalMarkss
  },
  register: async (payload) => {
    const personalMarks = await personalMarksRepository.createPersonalMarks(payload)
    return personalMarks
  },
})
