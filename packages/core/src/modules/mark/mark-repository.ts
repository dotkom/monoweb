import { type Kysely, type Selectable } from "kysely"
import { type Mark, type MarkId, MarkSchema, type MarkWrite } from "@dotkomonline/types"
import { type Database } from "@dotkomonline/db"
import { type Cursor, orderedQuery } from "./../../utils/db-utils"

export const mapToMark = (payload: Selectable<Database["mark"]>): Mark => MarkSchema.parse(payload)

export interface MarkRepository {
  getById(id: MarkId): Promise<Mark | undefined>
  getAll(take: number, cursor?: Cursor): Promise<Mark[]>
  create(markInsert: MarkWrite): Promise<Mark | undefined>
  update(id: MarkId, markUpdate: MarkWrite): Promise<Mark | undefined>
  delete(id: MarkId): Promise<Mark | undefined>
}

export class MarkRepositoryImpl implements MarkRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getById(id: MarkId): Promise<Mark | undefined> {
    const mark = await this.db.selectFrom("mark").selectAll().where("id", "=", id).executeTakeFirst()
    return mark ? mapToMark(mark) : undefined
  }

  async getAll(take: number, cursor?: Cursor): Promise<Mark[]> {
    const query = orderedQuery(this.db.selectFrom("mark").selectAll().limit(take), cursor)
    const marks = await query.execute()
    return marks.map(mapToMark)
  }

  async create(markInsert: MarkWrite): Promise<Mark | undefined> {
    const mark = await this.db
      .insertInto("mark")
      .values({ ...markInsert, createdAt: new Date() })
      .returningAll()
      .executeTakeFirst()
    return mark ? mapToMark(mark) : undefined
  }

  async update(id: MarkId, markUpdate: MarkWrite): Promise<Mark | undefined> {
    const mark = await this.db
      .updateTable("mark")
      .set({ ...markUpdate, updatedAt: new Date() })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst()
    return mark ? mapToMark(mark) : undefined
  }

  async delete(id: MarkId): Promise<Mark | undefined> {
    const mark = await this.db.deleteFrom("mark").where("id", "=", id).returningAll().executeTakeFirst()
    return mark ? mapToMark(mark) : undefined
  }
}
