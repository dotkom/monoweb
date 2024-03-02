import { InterestGroup, InterestGroupId, InterestGroupSchema, InterestGroupWrite } from "@dotkomonline/types"
import { type Kysely, type Selectable } from "kysely"
import { type Database } from "@dotkomonline/db"
import { type Collection, type Pageable, paginatedQuery, orderedQuery } from "../../utils/db-utils"

export interface InterestGroupRepository {
  getById(id: InterestGroupId): Promise<InterestGroup | undefined>
  getAll(pageable: Pageable): Promise<InterestGroup[] | undefined>
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

  async getAll(pageable: Pageable): Promise<InterestGroup[] | undefined> {
    const interestGroups = await this.db.selectFrom("interestGroup").selectAll().execute()
    return interestGroups.map(mapToInterestGroup)
  }

  async create(values: InterestGroupWrite): Promise<InterestGroup> {
    const interestGroup = await this.db
      .insertInto("interestGroup")
      .values({ ...values })
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
