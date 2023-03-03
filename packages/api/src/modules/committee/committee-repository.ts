import { Cursor, paginateQuery } from "../../utils/db-utils"
import { Database } from "@dotkomonline/db"
import { Committee, CommitteeSchema, CommitteeWrite } from "@dotkomonline/types"
import { Kysely, Selectable } from "kysely"

const mapToCommittee = (payload: Selectable<Database["committee"]>): Committee => {
  return CommitteeSchema.parse(payload)
}

export interface CommitteeRepository {
  getById(id: string): Promise<Committee | undefined>
  getAll(take: number, cursor?: Cursor): Promise<Committee[]>
  create(values: CommitteeWrite): Promise<Committee>
}

export class CommitteeRepositoryImpl implements CommitteeRepository {
  constructor(private db: Kysely<Database>) {}

  async getById(id: string) {
    const committee = await this.db.selectFrom("committee").selectAll().where("id", "=", id).executeTakeFirst()
    return committee ? mapToCommittee(committee) : undefined
  }

  async getAll(take: number, cursor?: Cursor) {
    let query = this.db.selectFrom("committee").selectAll().limit(take)
    if (cursor) {
      query = paginateQuery(query, cursor)
    }
    const committees = await query.execute()
    return committees.map(mapToCommittee)
  }

  async create(values: CommitteeWrite) {
    const committee = await this.db
      .insertInto("committee")
      .values({
        name: values.name,
      })
      .returningAll()
      // It should not be possible for this to throw, since there are no
      // restrictions on creating committees, as name is not unique.
      .executeTakeFirstOrThrow()
    return mapToCommittee(committee)
  }
}
