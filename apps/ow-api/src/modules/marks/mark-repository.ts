import { Database } from "@dotkomonline/db"
import { Kysely } from "kysely"
import { InsertMark, mapToMark, Mark } from "./mark"

export interface MarkRepository {
  getMarkByID: (id: string) => Promise<Mark | undefined>
  getMarks: (limit: number) => Promise<Mark[]>
  createMark: (markInsert: InsertMark) => Promise<Mark | undefined>
  updateMark: (id: string, markUpdate: InsertMark) => Promise<Mark | undefined>
  deleteMark: (id: string) => Promise<Mark | undefined>
}

export const initMarkRepository = (db: Kysely<Database>): MarkRepository => {
  const repo: MarkRepository = {
    getMarkByID: async (id) => {
      const mark = await db.selectFrom("Mark").selectAll().where("id", "=", id).executeTakeFirst()
      return mark ? mapToMark(mark) : undefined
    },
    getMarks: async (limit) => {
      const marks = await db.selectFrom("Mark").selectAll().limit(limit).execute()
      return marks.map(mapToMark)
    },
    createMark: async (markInsert) => {
      const mark = await db
        .insertInto("Mark")
        .values({ ...markInsert })
        .returningAll()
        .executeTakeFirst()
      return mark ? mapToMark(mark) : undefined
    },
    updateMark: async (id, markUpdate) => {
      const mark = await db.updateTable("Mark").set(markUpdate).where("id", "=", id).returningAll().executeTakeFirst()
      return mark ? mapToMark(mark) : undefined
    },
    deleteMark: async (id) => {
      const mark = await db.deleteFrom("Mark").where("id", "=", id).returningAll().executeTakeFirst()
      return mark ? mapToMark(mark) : undefined
    },
  }
  return repo
}
