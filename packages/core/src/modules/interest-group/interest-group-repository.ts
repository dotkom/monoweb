import type { Database } from "@dotkomonline/db"
import {
  type InterestGroup,
  type InterestGroupId,
  InterestGroupSchema,
  type InterestGroupWrite,
} from "@dotkomonline/types"
import type { Kysely, Selectable } from "kysely"
import { type Pageable, type PaginatedResult, singleColPaginatedQuery } from "../../utils/cursor"

export interface InterestGroupRepository {
  getById(id: InterestGroupId): Promise<InterestGroup | undefined>
  getAll(pageable: Pageable): Promise<PaginatedResult<InterestGroup>>
  create(values: InterestGroupWrite): Promise<InterestGroup>
  update(id: InterestGroupId, values: Partial<InterestGroupWrite>): Promise<InterestGroup>
  delete(id: InterestGroupId): Promise<void>
}

function mapToInterestGroup(interestGroup: Selectable<Database["interestGroup"]>): InterestGroup {
  return InterestGroupSchema.parse(interestGroup)
}

export class InterestGroupRepositoryImpl implements InterestGroupRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getById(id: InterestGroupId): Promise<InterestGroup | undefined> {
    const interestGroup = await this.db.selectFrom("interestGroup").selectAll().where("id", "=", id).executeTakeFirst()
    return interestGroup ? mapToInterestGroup(interestGroup) : undefined
  }

  async getAll(pageable: Pageable) {
    const query = this.db.selectFrom("interestGroup").selectAll()

    const result = await singleColPaginatedQuery(query, {
      pageable,
      column: ["id"],
      order: "desc",
    })

    return {
      next: result.next,
      data: result.data.map(mapToInterestGroup),
    }
  }

  async create(values: InterestGroupWrite): Promise<InterestGroup> {
    const interestGroup = await this.db
      .insertInto("interestGroup")
      .values({ ...values, createdAt: new Date(), updatedAt: new Date() })
      .returningAll()
      .executeTakeFirstOrThrow()
    return mapToInterestGroup(interestGroup)
  }

  async update(id: InterestGroupId, values: Partial<InterestGroupWrite>): Promise<InterestGroup> {
    const interestGroup = await this.db
      .updateTable("interestGroup")
      .set({ ...values, updatedAt: new Date() })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()
    return mapToInterestGroup(interestGroup)
  }

  async delete(id: InterestGroupId): Promise<void> {
    await this.db.deleteFrom("interestGroup").where("id", "=", id).execute()
  }
}
