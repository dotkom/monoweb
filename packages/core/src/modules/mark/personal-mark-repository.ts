import { type Kysely, type Selectable } from "kysely"
import { type Mark, type MarkId, type PersonalMark, PersonalMarkSchema, type UserId } from "@dotkomonline/types"
import { type Database } from "@dotkomonline/db"
import { mapToMark } from "./mark-repository"
import { type Cursor, orderedQuery } from "../../utils/db-utils"

export const mapToPersonalMark = (payload: Selectable<Database["personalMark"]>): PersonalMark =>
  PersonalMarkSchema.parse(payload)

export interface PersonalMarkRepository {
  getByMarkId(markId: MarkId): Promise<PersonalMark[]>
  getAllByUserId(userId: UserId, take: number, cursor?: Cursor): Promise<PersonalMark[]>
  getAllMarksByUserId(userId: UserId, take: number, cursor?: Cursor): Promise<Mark[]>
  addToUserId(userId: UserId, markId: MarkId): Promise<PersonalMark | undefined>
  removeFromUserId(userId: UserId, markId: MarkId): Promise<PersonalMark | undefined>
  getByUserId(userId: UserId, markId: MarkId): Promise<PersonalMark | undefined>
  countUsersByMarkId: ((markId: MarkId) => Promise<number>) & ((markId: MarkId) => Promise<number>)
}

export class PersonalMarkRepositoryImpl implements PersonalMarkRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getAllByUserId(userId: UserId, take: number, cursor?: Cursor): Promise<PersonalMark[]> {
    const query = orderedQuery(
      this.db
        .selectFrom("personalMark")
        .leftJoin("mark", "personalMark.markId", "mark.id")
        .selectAll("personalMark")
        .where("userId", "=", userId)
        .limit(take),
      cursor
    )
    const marks = await query.execute()
    return marks.map(mapToPersonalMark)
  }

  async getAllMarksByUserId(userId: UserId, take: number, cursor?: Cursor): Promise<Mark[]> {
    const query = orderedQuery(
      this.db
        .selectFrom("mark")
        .leftJoin("personalMark", "mark.id", "personalMark.markId")
        .selectAll("mark")
        .where("personalMark.userId", "=", userId)
        .limit(take),
      cursor
    )
    const marks = await query.execute()
    return marks.map(mapToMark)
  }

  async getByMarkId(markId: MarkId): Promise<PersonalMark[]> {
    const personalMarks = await this.db.selectFrom("personalMark").selectAll().where("markId", "=", markId).execute()
    return personalMarks.map(mapToPersonalMark)
  }

  async addToUserId(userId: UserId, markId: MarkId): Promise<PersonalMark | undefined> {
    const personalMark = await this.db
      .insertInto("personalMark")
      .values({ userId, markId })
      .returningAll()
      .executeTakeFirst()
    return personalMark ? mapToPersonalMark(personalMark) : undefined
  }

  async removeFromUserId(userId: UserId, markId: MarkId): Promise<PersonalMark | undefined> {
    const personalMark = await this.db
      .deleteFrom("personalMark")
      .where("userId", "=", userId)
      .where("markId", "=", markId)
      .returningAll()
      .executeTakeFirst()
    return personalMark ? mapToPersonalMark(personalMark) : undefined
  }

  async getByUserId(userId: UserId, markId: MarkId): Promise<PersonalMark | undefined> {
    const personalMark = await this.db
      .selectFrom("personalMark")
      .selectAll()
      .where("userId", "=", userId)
      .where("markId", "=", markId)
      .executeTakeFirst()
    return personalMark ? mapToPersonalMark(personalMark) : undefined
  }

  async countUsersByMarkId(markId: MarkId): Promise<number> {
    const result = await this.db
      .selectFrom("personalMark")
      .select((mark) => mark.fn.count("userId").as("count"))
      .where("markId", "=", markId)
      .executeTakeFirst()

    return Number(result?.count) || 0
  }
}
