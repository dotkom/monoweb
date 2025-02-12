import type { Database } from "@dotkomonline/db"
import {
  type InterestGroup,
  type InterestGroupId,
  type InterestGroupMember,
  InterestGroupMemberSchema,
  InterestGroupSchema,
  type InterestGroupWrite,
  type UserId,
} from "@dotkomonline/types"
import type { Kysely, Selectable } from "kysely"
import { type Collection, type Pageable, paginatedQuery } from "../../query"

export interface InterestGroupRepository {
  getById(id: InterestGroupId): Promise<InterestGroup | undefined>
  getAll(pageable: Pageable): Promise<Collection<InterestGroup>>
  create(values: InterestGroupWrite): Promise<InterestGroup>
  update(id: InterestGroupId, values: Partial<InterestGroupWrite>): Promise<InterestGroup>
  delete(id: InterestGroupId): Promise<void>
  getAllMembers(id: InterestGroupId): Promise<InterestGroupMember[]>
  getAllByMember(userId: UserId): Promise<InterestGroup[]>
  addMember(interestGroupId: InterestGroupId, userId: UserId): Promise<InterestGroupMember>
  removeMember(interestGroupId: InterestGroupId, userId: UserId): Promise<void>
}

export function mapToInterestGroup(interestGroup: Selectable<Database["interestGroup"]>): InterestGroup {
  return InterestGroupSchema.parse(interestGroup)
}

export function mapToInterestGroupMember(
  interestGroupMember: Selectable<Database["interestGroupMember"]>
): InterestGroupMember {
  return InterestGroupMemberSchema.parse(interestGroupMember)
}

export class InterestGroupRepositoryImpl implements InterestGroupRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getById(id: InterestGroupId): Promise<InterestGroup | undefined> {
    const interestGroup = await this.db.selectFrom("interestGroup").selectAll().where("id", "=", id).executeTakeFirst()
    return interestGroup ? mapToInterestGroup(interestGroup) : undefined
  }

  async getAll(pageable: Pageable): Promise<Collection<InterestGroup>> {
    const res = paginatedQuery(this.db.selectFrom("interestGroup").selectAll(), pageable, mapToInterestGroup)
    return res
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

  async getAllMembers(id: InterestGroupId): Promise<InterestGroupMember[]> {
    const members = await this.db
      .selectFrom("interestGroupMember")
      .selectAll("interestGroupMember")
      .where("interestGroupId", "=", id)
      .execute()

    return members.map(mapToInterestGroupMember)
  }

  async getAllByMember(userId: UserId): Promise<InterestGroup[]> {
    const interestGroups = await this.db
      .selectFrom("interestGroup")
      .innerJoin("interestGroupMember", "interestGroupMember.userId", "interestGroup.id")
      .selectAll("interestGroup")
      .where("interestGroupMember.userId", "=", userId)
      .execute()

    return interestGroups.map(mapToInterestGroup)
  }

  async addMember(interestGroupId: InterestGroupId, userId: UserId): Promise<InterestGroupMember> {
    const interestGroupMember = await this.db
      .insertInto("interestGroupMember")
      .values({ interestGroupId: interestGroupId, userId: userId })
      .returningAll()
      .executeTakeFirstOrThrow()

    return mapToInterestGroupMember(interestGroupMember)
  }

  async removeMember(interestGroupId: InterestGroupId, userId: UserId): Promise<void> {
    await this.db
      .deleteFrom("interestGroupMember")
      .where("interestGroupId", "=", interestGroupId)
      .where("userId", "=", userId)
      .execute()
  }
}
