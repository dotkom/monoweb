import { PersonalMark, personalMarkSchema } from "@dotkomonline/types/src/personal-mark"
import { Database } from "@dotkomonline/db"
import { Kysely, Selectable } from "kysely"

export const mapToPersonalMark = (payload: Selectable<Database["personalMark"]>): PersonalMark => {
  return personalMarkSchema.parse(payload)
}

export interface PersonalMarkRepository {
  getPersonalMarksForUser: (userId: string) => Promise<PersonalMark[]>
  addPersonalMarkToUser: (userId: string, markId: string) => Promise<PersonalMark | undefined>
  removePersonalMark: (userId: string, markId: string) => Promise<PersonalMark | undefined>
}

export const initPersonalMarkRepository = (db: Kysely<Database>): PersonalMarkRepository => {
  const repo: PersonalMarkRepository = {
    getPersonalMarksForUser: async (userId: string) => {
      const marks = await db.selectFrom("personalMark").selectAll().where("personalMark.userId", "=", userId).execute()
      return marks.map(mapToPersonalMark)
    },
    addPersonalMarkToUser: async (userId: string, markId: string) => {
      const personalMark = await db
        .insertInto("personalMark")
        .values({ userId, markId })
        .returningAll()
        .executeTakeFirst()
      return personalMark ? mapToPersonalMark(personalMark) : personalMark
    },
    removePersonalMark: async (userId: string, markId: string) => {
      const personalMark = await db
        .deleteFrom("personalMark")
        .where("userId", "=", userId)
        .where("markId", "=", markId)
        .returningAll()
        .executeTakeFirst()
      return personalMark ? mapToPersonalMark(personalMark) : personalMark
    },
  }
  return repo
}
