import { type Committee, type CommitteeId, CommitteeSchema, type CommitteeWrite } from "@dotkomonline/types"
import { type Kysely, type Selectable } from "kysely"
import { type Database } from "@dotkomonline/db"
import { type Cursor, orderedQuery } from "../../utils/db-utils"

export const mapToCommittee = (payload: Selectable<Database["committee"]>): Committee => CommitteeSchema.parse(payload)

export interface CommitteeRepository {
  getById(id: CommitteeId): Promise<Committee | undefined>
  getAll(take: number, cursor?: Cursor): Promise<Committee[]>
  create(values: CommitteeWrite): Promise<Committee>
}

export class CommitteeRepositoryImpl implements CommitteeRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getById(id: CommitteeId) {
    const committee = await this.db.selectFrom("committee").selectAll().where("id", "=", id).executeTakeFirst()
    return committee ? mapToCommittee(committee) : undefined
  }

  async getAll(take: number, cursor?: Cursor) {
    const query = orderedQuery(this.db.selectFrom("committee").selectAll().limit(take), cursor)
    const committees = await query.execute()
    return committees.map(mapToCommittee)
  }

  async create(values: CommitteeWrite) {
    const committee = await this.db
      .insertInto("committee")
      .values(values)
      .returningAll()
      // It should not be possible for this to throw, since there are no
      // restrictions on creating committees, as name is not unique.
      .executeTakeFirstOrThrow()
    return mapToCommittee(committee)
  }
}
