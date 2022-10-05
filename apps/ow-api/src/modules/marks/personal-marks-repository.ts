import { PrismaClient } from "@dotkom/db"
import { InsertPersonalMarks, mapToPersonalMarks, PersonalMarks } from "./personal-marks"

export interface PersonalMarksRepository {
  getPersonalMarkByID: (id: string) => Promise<PersonalMarks | undefined>
  getPersonalMarks: (limit: number) => Promise<PersonalMarks[]>
  createPersonalMark: (personalMarksInsert: InsertPersonalMarks) => Promise<PersonalMarks>
}

export const initPersonalMarksRepository = (client: PrismaClient): PersonalMarksRepository => {
  const repo: PersonalMarksRepository = {
    getPersonalMarkByID: async (id) => {
      const personalMarks = await client.personalMarks.findUnique({
        where: { id },
      })
      return personalMarks ? mapToPersonalMarks(personalMarks) : undefined
    },
    getPersonalMarks: async (limit: number) => {
      const personalMarkss = await client.personalMarks.findMany({ take: limit })
      return personalMarkss.map(mapToPersonalMarks)
    },
    createPersonalMark: async (personalMarksInsert) => {
      const personalMarks = await client.personalMarks.create({
        data: {
          ...personalMarksInsert,
        },
      })
      return mapToPersonalMarks(personalMarks)
    },
  }
  return repo
}
