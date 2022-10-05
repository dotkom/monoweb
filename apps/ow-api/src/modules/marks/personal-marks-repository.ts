import { PrismaClient } from "@dotkom/db"
import { InsertPersonalMarks, mapToPersonalMarks, PersonalMarks } from "./personal-marks"

export interface PersonalMarksRepository {
  getPersonalMarksByID: (id: string) => Promise<PersonalMarks | undefined>
  getPersonalMarkss: (limit: number) => Promise<PersonalMarks[]>
  createPersonalMarks: (personalMarksInsert: InsertPersonalMarks) => Promise<PersonalMarks>
}

export const initPersonalMarksRepository = (client: PrismaClient): PersonalMarksRepository => {
  const repo: PersonalMarksRepository = {
    getPersonalMarksByID: async (id) => {
      const personalMarks = await client.personalMarks.findUnique({
        where: { id },
      })
      return personalMarks ? mapToPersonalMarks(personalMarks) : undefined
    },
    getPersonalMarkss: async (limit: number) => {
      const personalMarkss = await client.personalMarks.findMany({ take: limit })
      return personalMarkss.map(mapToPersonalMarks)
    },
    createPersonalMarks: async (personalMarksInsert) => {
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
