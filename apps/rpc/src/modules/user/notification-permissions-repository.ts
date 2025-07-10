import type { DBHandle } from "@dotkomonline/db"
import type { NotificationPermissions, NotificationPermissionsWrite, UserId } from "@dotkomonline/types"

export interface NotificationPermissionsRepository {
  getByUserId(handle: DBHandle, id: UserId): Promise<NotificationPermissions | null>
  create(handle: DBHandle, userId: UserId, data: NotificationPermissionsWrite): Promise<NotificationPermissions>
  update(
    handle: DBHandle,
    userId: UserId,
    data: Partial<NotificationPermissionsWrite>
  ): Promise<NotificationPermissions>
}

export function getNotificationPermissionsRepository(): NotificationPermissionsRepository {
  return {
    async getByUserId(handle, userId) {
      return await handle.notificationPermissions.findUnique({ where: { userId } })
    },
    async create(handle, userId, data) {
      return await handle.notificationPermissions.create({ data: { ...data, userId } })
    },
    async update(handle, userId, data) {
      return await handle.notificationPermissions.update({ where: { userId }, data })
    },
  }
}
