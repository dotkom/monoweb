import type { DBClient } from "@dotkomonline/db"
import type { PrivacyPermissions, PrivacyPermissionsWrite, UserId } from "@dotkomonline/types"

export interface PrivacyPermissionsRepository {
  getByUserId(userId: UserId): Promise<PrivacyPermissions | null>
  create(data: Partial<PrivacyPermissionsWrite>): Promise<PrivacyPermissions>
  update(userId: UserId, data: Partial<Omit<PrivacyPermissionsWrite, "userId">>): Promise<PrivacyPermissions | null>
}

export class PrivacyPermissionsRepositoryImpl implements PrivacyPermissionsRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  public async getByUserId(userId: UserId) {
    return await this.db.privacyPermissions.findUnique({ where: { userId } })
  }

  public async create(data: PrivacyPermissionsWrite) {
    return await this.db.privacyPermissions.create({ data })
  }

  public async update(userId: UserId, data: Partial<Omit<PrivacyPermissionsWrite, "userId">>) {
    return await this.db.privacyPermissions.update({ data, where: { id: userId } })
  }
}
