import { type Kysely, type Selectable } from "kysely"
import { type Mark, type PersonalMark, PersonalMarkSchema, type User } from "@dotkomonline/types"
import { type Database } from "@dotkomonline/db"
import { mapToMark } from "./mark-repository"
import { type Cursor, paginateQuery } from "../../utils/db-utils"

export const mapToPersonalMark = (payload: Selectable<Database["personalMark"]>): PersonalMark =>
  PersonalMarkSchema.parse(payload)

export interface PersonalMarkRepository {
  getAllByUserId: (userId: User["id"], take: number, cursor?: Cursor) => Promise<PersonalMark[]>
  getAllMarksByUserId: (userId: User["id"], take: number, cursor?: Cursor) => Promise<Mark[]>
  addToUserId: (userId: User["id"], markId: Mark["id"]) => Promise<PersonalMark | undefined>
  removeFromUserId: (userId: User["id"], markId: Mark["id"]) => Promise<PersonalMark | undefined>
  getByUserId: (userId: User["id"], markId: Mark["id"]) => Promise<PersonalMark | undefined>
}

export class PersonalMarkRepositoryImpl implements PersonalMarkRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getAllByUserId(userId: User["id"], take: number, cursor?: Cursor): Promise<PersonalMark[]> {
    let query = this.db
      .selectFrom("personalMark")
      .leftJoin("mark", "personalMark.markId", "mark.id")
      .selectAll("personalMark")
      .where("userId", "=", userId)
      .limit(take)
    if (cursor) {
      query = paginateQuery(query, cursor)
    } else {
      query = query.orderBy("createdAt", "desc").orderBy("id", "desc")
    }
    const marks = await query.execute()
    return marks.map(mapToPersonalMark)
  }

  async getAllMarksByUserId(userId: User["id"], take: number, cursor?: Cursor): Promise<Mark[]> {
    let query = this.db
      .selectFrom("mark")
      .leftJoin("personalMark", "mark.id", "personalMark.markId")
      .selectAll("mark")
      .where("personalMark.userId", "=", userId)
      .limit(take)
    if (cursor) {
      query = paginateQuery(query, cursor)
    } else {
      query = query.orderBy("createdAt", "desc").orderBy("id", "desc")
    }
    const marks = await query.execute()
    return marks.map(mapToMark)
  }

  async addToUserId(userId: User["id"], markId: Mark["id"]): Promise<PersonalMark | undefined> {
    const personalMark = await this.db
      .insertInto("personalMark")
      .values({ userId, markId })
      .returningAll()
      .executeTakeFirst()
    return personalMark ? mapToPersonalMark(personalMark) : undefined
  }

  async removeFromUserId(userId: User["id"], markId: Mark["id"]): Promise<PersonalMark | undefined> {
    const personalMark = await this.db
      .deleteFrom("personalMark")
      .where("userId", "=", userId)
      .where("markId", "=", markId)
      .returningAll()
      .executeTakeFirst()
    return personalMark ? mapToPersonalMark(personalMark) : undefined
  }

  async getByUserId(userId: User["id"], markId: Mark["id"]): Promise<PersonalMark | undefined> {
    const personalMark = await this.db
      .selectFrom("personalMark")
      .selectAll()
      .where("userId", "=", userId)
      .where("markId", "=", markId)
      .executeTakeFirst()
    return personalMark ? mapToPersonalMark(personalMark) : undefined
  }
}
