import { PrismaClient } from "@dotkom/db"
import { mapToPersonalMark, PersonalMark } from "./personal-mark"

export interface PersonalMarkRepository {
  getPersonalMarksForUser: (userId: string) => Promise<PersonalMark[]>
  addPersonalMarkToUser: (userId: string, markId: string) => Promise<PersonalMark>
  removePersonalMark: (userId: string, markId: string) => Promise<PersonalMark>
}

export const initPersonalMarkRepository = (client: PrismaClient): PersonalMarkRepository => {
  const repo: PersonalMarkRepository = {
    getPersonalMarksForUser: async (userId: string) => {
      const personalMark = await client.personalMark.findMany({
        where: {
          userId,
        },
      })
      return personalMark.map(mapToPersonalMark)
    },
    addPersonalMarkToUser: async (markId: string, userId: string) => {
      const personalMark = await client.personalMark.create({
        data: {
          userId,
          markId,
        },
      })
      return mapToPersonalMark(personalMark)
    },
    removePersonalMark: async (markId: string, userId: string) => {
      const personalMark = await client.personalMark.delete({ where: { markId_userId: { userId, markId } } })
      return mapToPersonalMark(personalMark)
    },
  }
  return repo
}
