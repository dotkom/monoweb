import type { DBClient } from "@dotkomonline/db"
import type { NotificationPermissions, NotificationPermissionsWrite, UserId } from "@dotkomonline/types"

export interface NotificationPermissionsRepository {
  getByUserId(id: UserId): Promise<NotificationPermissions | null>
  create(data: Partial<NotificationPermissionsWrite>): Promise<NotificationPermissions>
  update(userId: UserId, data: Partial<Omit<NotificationPermissionsWrite, "userId">>): Promise<NotificationPermissions>
}

export class NotificationPermissionsRepositoryImpl implements NotificationPermissionsRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  public async getByUserId(userId: UserId) {
    return await this.db.notificationPermissions.findUnique({ where: { userId } })
  }

  public async create(data: NotificationPermissionsWrite) {
    return await this.db.notificationPermissions.create({ data })
  }

  public async update(userId: UserId, data: Partial<Omit<NotificationPermissionsWrite, "userId">>) {
    return await this.db.notificationPermissions.update({ where: { userId }, data })
  }
}
