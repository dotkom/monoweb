import type { DBHandle } from "@dotkomonline/db"
import {
  type NotificationPermissions,
  NotificationPermissionsSchema,
  type NotificationPermissionsWrite,
  type UserId,
} from "@dotkomonline/types"
import { parseOrReport } from "../../invariant.ts"

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
      const permissions = await handle.notificationPermissions.findUnique({ where: { userId } })
      return parseOrReport(NotificationPermissionsSchema, permissions)
    },
    async create(handle, userId, data) {
      const permissions = await handle.notificationPermissions.create({ data: { ...data, userId } })
      return parseOrReport(NotificationPermissionsSchema, permissions)
    },
    async update(handle, userId, data) {
      const permissions = await handle.notificationPermissions.update({ where: { userId }, data })
      return parseOrReport(NotificationPermissionsSchema, permissions)
    },
  }
}
