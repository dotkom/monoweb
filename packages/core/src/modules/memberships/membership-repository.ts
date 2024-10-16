import type { Database } from "@dotkomonline/db"
import { FeideDocumentation, type Membership, MembershipSchema, type UserId } from "@dotkomonline/types"
import type { Kysely, Selectable } from "kysely"
import { type Cursor, withInsertJsonValue } from "../../utils/db-utils"

export interface MembershipRepository {
  getById(id: UserId): Promise<Membership | undefined>
  getAll(take: number, cursor?: Cursor): Promise<Membership[]>
  create(userId: UserId, membershipmembershipInsert: Membership): Promise<Membership>
  update(userId: UserId, membershipmembershipUpdate: Membership): Promise<Membership | undefined>
  delete(id: UserId): Promise<Membership | undefined>
}

export const mapToMembership = (
  payload: Selectable<Database["memberships"]>
): Membership => MembershipSchema.parse(payload)

export class MembershipRepositoryImpl implements MembershipRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getById(id: UserId): Promise<Membership | undefined> {
    const membership = await this.db
      .selectFrom("memberships")
      .selectAll()
      .where("userId", "=", id)
      .executeTakeFirst()
    return membership ? mapToMembership(membership) : undefined
  }

  async getAll(take: number, cursor?: Cursor): Promise<Membership[]> {
    const memberships = await this.db.selectFrom("memberships").selectAll().limit(take).execute()

    return memberships.map(mapToMembership)
  }

  async create(userId: UserId, membershipInsert: Membership): Promise<Membership> {
    const membership = await this.db
      .insertInto("memberships")
      .values({...membershipInsert, userId})
      .returningAll()
      .executeTakeFirstOrThrow()
    return mapToMembership(membership)
  }

  async update(userId: UserId, membershipUpdate: Membership): Promise<Membership | undefined> {
    const membership = await this.db
      .updateTable("memberships")
      .set(membershipUpdate)
      .where("userId", "=", userId)
      .returningAll()
      .executeTakeFirst()
    return membership ? mapToMembership(membership) : undefined
  }

  async delete(id: UserId): Promise<Membership | undefined> {
    const membership = await this.db
      .deleteFrom("memberships")
      .where("userId", "=", id)
      .returningAll()
      .executeTakeFirst()
    return membership ? mapToMembership(membership) : undefined
  }
}
