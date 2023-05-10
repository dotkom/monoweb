import { Cursor, paginateQuery } from "../../utils/db-utils"
import { Kysely, Selectable } from "kysely"
import { Mark, PersonalMark, User, personalMarkSchema } from "@dotkomonline/types"

import { Database } from "@dotkomonline/db"
import { mapToMark } from "./mark-repository"

export const mapToPersonalMark = (payload: Selectable<Database["personalMark"]>): PersonalMark => {
  return personalMarkSchema.parse(payload)
}

export interface PersonalMarkRepository {
  getAllByUserId(userId: User["id"], take: number, cursor?: Cursor): Promise<Mark[]>
  addToUserId(userId: User["id"], markId: Mark["id"]): Promise<PersonalMark | undefined>
  removeFromUserId(userId: User["id"], markId: Mark["id"]): Promise<PersonalMark | undefined>
  getByUserId(userId: User["id"], markId: Mark["id"]): Promise<PersonalMark | undefined>
}

export class PersonalMarkRepositoryImpl implements PersonalMarkRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getAllByUserId(userId: User["id"], take: number, cursor?: Cursor): Promise<Mark[]> {
    let query = this.db
      .selectFrom("mark")
      .leftJoin("personalMark", "mark.id", "personalMark.markId")
      .selectAll("mark")
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
