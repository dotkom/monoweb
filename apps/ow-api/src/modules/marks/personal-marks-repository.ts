import { PrismaClient } from "@dotkom/db"
import { InsertPersonalMarks, mapToPersonalMarks, PersonalMarks } from "./personal-marks"

export interface PersonalMarksRepository {
  getPersonalMarksByID: (id: string) => Promise<PersonalMarks | undefined>
  getAllPersonalMarks: (limit: number) => Promise<PersonalMarks[]>
  createPersonalMarks: (personalMarksInsert: InsertPersonalMarks) => Promise<PersonalMarks>
  addActiveMark: (id: string, mark: string) => Promise<PersonalMarks | undefined>
  getActiveMarksByID: (id: string) => Promise<Array<string> | undefined>
}

export const initPersonalMarksRepository = (client: PrismaClient): PersonalMarksRepository => {
  const repo: PersonalMarksRepository = {
    getPersonalMarksByID: async (id) => {
      const personalMarks = await client.personalMarks.findUnique({
        where: { id },
      })
      return personalMarks ? mapToPersonalMarks(personalMarks) : undefined
    },
    getAllPersonalMarks: async (limit: number) => {
      const allPersonalMarks = await client.personalMarks.findMany({ take: limit })
      return allPersonalMarks.map(mapToPersonalMarks)
    },
    createPersonalMarks: async (personalMarksInsert) => {
      const personalMarks = await client.personalMarks.create({
        data: {
          ...personalMarksInsert,
        },
      })
      return mapToPersonalMarks(personalMarks)
    },
    getActiveMarksByID: async (id) => {
      const personalMarks = await repo.getPersonalMarksByID(id)
      return personalMarks?.active_marks
    },
    addActiveMark: async (id, mark) => {
      const activeMarks = await repo.getActiveMarksByID(id)
      if (activeMarks == undefined) {
        return undefined
      }
      const personalMarks = client.personalMarks.update({
        where: { id },
        data: { active_marks: [...activeMarks, mark] },
      })
      return personalMarks
    },
  }
  return repo
}
