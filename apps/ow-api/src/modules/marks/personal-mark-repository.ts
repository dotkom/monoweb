import { mapToPersonalMark, PersonalMark } from "./personal-mark"
import { Database } from "@dotkomonline/db"
import { Kysely } from "kysely"

export interface PersonalMarkRepository {
  getPersonalMarksForUser: (userId: string) => Promise<PersonalMark[]>
  addPersonalMarkToUser: (userId: string, markId: string) => Promise<PersonalMark | undefined>
  removePersonalMark: (userId: string, markId: string) => Promise<PersonalMark | undefined>
}

export const initPersonalMarkRepository = (db: Kysely<Database>): PersonalMarkRepository => {
  const repo: PersonalMarkRepository = {
    getPersonalMarksForUser: async (userId: string) => {
      const marks = await db.selectFrom("PersonalMark").selectAll().where("PersonalMark.userId", "=", userId).execute()
      return marks.map(mapToPersonalMark)
    },
    addPersonalMarkToUser: async (userId: string, markId: string) => {
      const personalMark = await db
        .insertInto("PersonalMark")
        .values({ userId, markId })
        .returningAll()
        .executeTakeFirst()
      return personalMark ? mapToPersonalMark(personalMark) : personalMark
    },
    removePersonalMark: async (userId: string, markId: string) => {
      const personalMark = await db
        .deleteFrom("PersonalMark")
        .where("userId", "=", userId)
        .where("markId", "=", markId)
        .returningAll()
        .executeTakeFirst()
      return personalMark ? mapToPersonalMark(personalMark) : personalMark
    },
  }
  return repo
}
