import { PrismaClient } from "@dotkom/db"
import { InsertPersonalMark, mapToPersonalMark, PersonalMark } from "./personal-mark"

export interface PersonalMarkRepository {
  getPersonalMarksForUser: (userId: string) => Promise<PersonalMark[]>
  addPersonalMarkToUser: (userId: string, markId: string) => Promise<PersonalMark>
}

export const initPersonalMarkRepository = (client: PrismaClient): PersonalMarkRepository => {
  const repo: PersonalMarkRepository = {
    getPersonalMarksForUser: async (userId: string) => {
      const personalMark = await client.personalMark.findMany({
        where: {
          userId,
        },
      })
      if (!personalMark) return undefined
      return personalMark.map(mapToPersonalMark)
    },
    addPersonalMarkToUser: async (userId: string, markId: string) => {
      const personalMark = await client.personalMark.create({
        data: {
          userId,
          markId,
        },
      })
      return mapToPersonalMark(personalMark)
    },
  }
  return repo
}
