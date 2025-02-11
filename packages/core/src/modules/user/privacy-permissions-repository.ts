import type { DBClient } from "@dotkomonline/db"
import {
  type PrivacyPermissions,
  type PrivacyPermissionsWrite,
  type UserId,
} from "@dotkomonline/types"

export interface PrivacyPermissionsRepository {
  getByUserId(id: UserId): Promise<PrivacyPermissions | undefined>
  create(data: Partial<PrivacyPermissionsWrite>): Promise<PrivacyPermissions>
  update(
    userId: string,
    data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
  ): Promise<PrivacyPermissions | undefined>
}

export class PrivacyPermissionsRepositoryImpl implements PrivacyPermissionsRepository {
  constructor(private readonly db: DBClient) {}

  async getByUserId(userId: UserId): Promise<PrivacyPermissions | null> {
    return await this.db.privacyPermissions.findUnique({ where: { userId } })
  }

  async create(data: PrivacyPermissionsWrite): Promise<PrivacyPermissions> {
    return await this.db.privacyPermissions.create({ data })
  }

  async update(
    id: string,
    data: Partial<PrivacyPermissionsWrite>
  ): Promise<PrivacyPermissions | undefined> {
    return await this.db.privacyPermissions.update({ data, where: { id } })
  }
}
