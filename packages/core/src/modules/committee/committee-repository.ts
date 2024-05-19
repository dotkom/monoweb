import type { Database } from "@dotkomonline/db"
import { type Committee, type CommitteeId, CommitteeSchema, type CommitteeWrite } from "@dotkomonline/types"
import type { Kysely, Selectable } from "kysely"
import { buildUlidIdCursor, decodeUlidIdCursor } from "../../utils/cursor-pagination/common-cursor-utils"
import { getNextCursor, paginatedQuery } from "../../utils/cursor-pagination/helpers"
import type { Collection, Pageable } from "../../utils/cursor-pagination/types"

export const mapToCommittee = (payload: Selectable<Database["committee"]>): Committee => CommitteeSchema.parse(payload)

export interface CommitteeRepository {
  getById(id: CommitteeId): Promise<Committee | undefined>
  getAll(pageable: Pageable): Promise<Collection<Committee>>
  getAllIds(): Promise<CommitteeId[]>
  create(values: CommitteeWrite): Promise<Committee>
}

export class CommitteeRepositoryImpl implements CommitteeRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getById(id: CommitteeId) {
    const committee = await this.db.selectFrom("committee").selectAll().where("id", "=", id).executeTakeFirst()
    return committee ? mapToCommittee(committee) : undefined
  }

  async getAll(pageable: Pageable) {
    const query = this.db.selectFrom("committee").selectAll()

    const records = await paginatedQuery(query, {
      pageable,
      decodeCursor: decodeUlidIdCursor,
    }).execute()

    const cursor = getNextCursor(records, {
      pageable,
      buildCursor: buildUlidIdCursor,
    })

    return {
      next: cursor,
      data: records.map(mapToCommittee),
    }
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

  async getAllIds() {
    return (await this.db.selectFrom("committee").select("id").execute()).map((row) => row.id)
  }
}
