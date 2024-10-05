import type { Database } from "@dotkomonline/db"
import { type MembershipApplication, MembershipApplicationSchema, type UserId } from "@dotkomonline/types"
import type { Kysely, Selectable } from "kysely"
import { type Cursor, withInsertJsonValue } from "../../utils/db-utils"

export interface MembershipApplicationRepository {
  getById(id: UserId): Promise<MembershipApplication | undefined>
  getAll(take: number, cursor?: Cursor): Promise<MembershipApplication[]>
  create(membershipRequestInsert: MembershipApplication): Promise<MembershipApplication>
  update(id: UserId, membershipRequestUpdate: MembershipApplication): Promise<MembershipApplication | undefined>
  delete(id: UserId): Promise<MembershipApplication | undefined>
}

export const mapToMembershipApplication = (
  payload: Selectable<Database["membershipRequests"]>
): MembershipApplication => MembershipApplicationSchema.parse(payload)

export class MembershipApplicationRepositoryImpl implements MembershipApplicationRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getById(id: UserId): Promise<MembershipApplication | undefined> {
    const request = await this.db
      .selectFrom("membershipRequests")
      .selectAll()
      .where("userId", "=", id)
      .executeTakeFirst()
    return request ? mapToMembershipApplication(request) : undefined
  }

  async getAll(take: number, cursor?: Cursor): Promise<MembershipApplication[]> {
    const requests = await this.db.selectFrom("membershipRequests").selectAll().limit(take).execute()

    return requests.map(mapToMembershipApplication)
  }

  async create(membershipRequestInsert: MembershipApplication): Promise<MembershipApplication> {
    const request = await this.db
      .insertInto("membershipRequests")
      .values(this.mapInsert(membershipRequestInsert))
      .returningAll()
      .executeTakeFirstOrThrow()
    return mapToMembershipApplication(request)
  }

  async update(id: UserId, membershipRequestUpdate: MembershipApplication): Promise<MembershipApplication | undefined> {
    const request = await this.db
      .updateTable("membershipRequests")
      .set(membershipRequestUpdate)
      .where("userId", "=", id)
      .returningAll()
      .executeTakeFirst()
    return request ? mapToMembershipApplication(request) : undefined
  }

  async delete(id: UserId): Promise<MembershipApplication | undefined> {
    const request = await this.db
      .deleteFrom("membershipRequests")
      .where("userId", "=", id)
      .returningAll()
      .executeTakeFirst()
    return request ? mapToMembershipApplication(request) : undefined
  }

  private mapInsert = (
    data: MembershipApplication
  ): Omit<Selectable<Database["membershipRequests"]>, "createdAt" | "updatedAt"> => {
    return withInsertJsonValue(data, "documentation")
  }
}
