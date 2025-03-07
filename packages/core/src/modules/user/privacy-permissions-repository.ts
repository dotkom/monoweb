import type { DBClient } from "@dotkomonline/db"
import type { PrivacyPermissions, PrivacyPermissionsWrite, UserId } from "@dotkomonline/types"

export interface PrivacyPermissionsRepository {
  getByUserId(id: UserId): Promise<PrivacyPermissions | null>
  create(data: Partial<PrivacyPermissionsWrite>): Promise<PrivacyPermissions>
  update(userId: string, data: Partial<Omit<PrivacyPermissionsWrite, "userId">>): Promise<PrivacyPermissions | null>
}

export class PrivacyPermissionsRepositoryImpl implements PrivacyPermissionsRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  async getByUserId(userId: UserId): Promise<PrivacyPermissions | null> {
    return await this.db.privacyPermissions.findUnique({ where: { userId } })
  }

  async create(data: PrivacyPermissionsWrite): Promise<PrivacyPermissions> {
    return await this.db.privacyPermissions.create({ data })
  }

  async update(id: string, data: Partial<PrivacyPermissionsWrite>): Promise<PrivacyPermissions | null> {
    return await this.db.privacyPermissions.update({ data, where: { id } })
  }
}
