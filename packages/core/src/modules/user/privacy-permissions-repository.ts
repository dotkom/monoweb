import { Kysely, Selectable } from "kysely"
import { PrivacyPermissions, PrivacyPermissionsSchema, PrivacyPermissionsWrite, UserId } from "@dotkomonline/types"

import { Database } from "@dotkomonline/db"

export const mapToPrivacyPermissions = (payload: Selectable<Database["privacyPermissions"]>): PrivacyPermissions => {
  return PrivacyPermissionsSchema.parse(payload)
}

export interface PrivacyPermissionsRepository {
  getByUserId(id: UserId): Promise<PrivacyPermissions | undefined>
  create(data: Partial<PrivacyPermissionsWrite>): Promise<PrivacyPermissions>
  update(
    userId: string,
    data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
  ): Promise<PrivacyPermissions | undefined>
}

export class PrivacyPermissionsRepositoryImpl implements PrivacyPermissionsRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getByUserId(id: UserId): Promise<PrivacyPermissions | undefined> {
    const privacyPermissions = await this.db
      .selectFrom("privacyPermissions")
      .selectAll()
      .where("userId", "=", id)
      .executeTakeFirst()

    return privacyPermissions ? mapToPrivacyPermissions(privacyPermissions) : undefined
  }

  async create(data: PrivacyPermissionsWrite): Promise<PrivacyPermissions> {
    const privacyPermissions = await this.db
      .insertInto("privacyPermissions")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow()

    return mapToPrivacyPermissions(privacyPermissions)
  }

  async update(
    userId: UserId,
    data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
  ): Promise<PrivacyPermissions | undefined> {
    const privacyPermissions = await this.db
      .updateTable("privacyPermissions")
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where("userId", "=", userId)
      .returningAll()
      .executeTakeFirst()

    return privacyPermissions ? mapToPrivacyPermissions(privacyPermissions) : undefined
  }
}
