import { Cursor, orderedQuery } from "../../utils/db-utils"
import { Kysely, Selectable } from "kysely"
import { Mark, PersonalMark, PersonalMarkSchema, User } from "@dotkomonline/types"

import { Database } from "@dotkomonline/db"
import { mapToMark } from "./mark-repository"

export const mapToPersonalMark = (payload: Selectable<Database["personalMark"]>): PersonalMark => {
  return PersonalMarkSchema.parse(payload)
}

export interface PersonalMarkRepository {
  getAllByUserId(userId: User["id"], take: number, cursor?: Cursor): Promise<PersonalMark[]>
  getAllMarksByUserId(userId: User["id"], take: number, cursor?: Cursor): Promise<Mark[]>
  addToUserId(userId: User["id"], markId: Mark["id"]): Promise<PersonalMark | undefined>
  removeFromUserId(userId: User["id"], markId: Mark["id"]): Promise<PersonalMark | undefined>
  getByUserId(userId: User["id"], markId: Mark["id"]): Promise<PersonalMark | undefined>
  countUsersByMarkId(markId: Mark["id"]): Promise<number>
}

export class PersonalMarkRepositoryImpl implements PersonalMarkRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getAllByUserId(userId: User["id"], take: number, cursor?: Cursor): Promise<PersonalMark[]> {
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

  async getAllMarksByUserId(userId: User["id"], take: number, cursor?: Cursor): Promise<Mark[]> {
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

  async countUsersByMarkId(markId: Mark["id"]): Promise<number> {
    const result = await this.db
      .selectFrom("personalMark")
      .select((mark) => mark.fn.count("userId").as("count"))
      .where("markId", "=", markId)
      .executeTakeFirst()

    return Number(result?.count) || 0
  }
}
