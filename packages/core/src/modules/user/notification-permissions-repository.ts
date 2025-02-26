import type { DBClient } from "@dotkomonline/db"
import type { NotificationPermissions, NotificationPermissionsWrite, UserId } from "@dotkomonline/types"

export interface NotificationPermissionsRepository {
  getByUserId(id: UserId): Promise<NotificationPermissions | null>
  create(data: Partial<NotificationPermissionsWrite>): Promise<NotificationPermissions>
  update(
    userId: UserId,
    data: Partial<Omit<NotificationPermissionsWrite, "userId">>
  ): Promise<NotificationPermissions | null>
}

export class NotificationPermissionsRepositoryImpl implements NotificationPermissionsRepository {
  constructor(private readonly db: DBClient) {}

  async getByUserId(userId: UserId): Promise<NotificationPermissions | null> {
    return await this.db.notificationPermissions.findUnique({ where: { userId } })
  }

  async create(data: NotificationPermissionsWrite): Promise<NotificationPermissions> {
    return await this.db.notificationPermissions.create({ data })
  }

  async update(
    userId: UserId,
    data: Partial<Omit<NotificationPermissionsWrite, "userId">>
  ): Promise<NotificationPermissions | null> {
    return await this.db.notificationPermissions.update({ where: { userId }, data })
  }
}
