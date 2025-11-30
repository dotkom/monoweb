import type { DBHandle } from "@dotkomonline/db"
import {
  type NotificationPermissions,
  NotificationPermissionsSchema,
  type NotificationPermissionsWrite,
  type UserId,
} from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"

export interface NotificationPermissionsRepository {
  create(handle: DBHandle, userId: UserId, data: NotificationPermissionsWrite): Promise<NotificationPermissions>
  update(
    handle: DBHandle,
    userId: UserId,
    data: Partial<NotificationPermissionsWrite>
  ): Promise<NotificationPermissions>
  findByUserId(handle: DBHandle, id: UserId): Promise<NotificationPermissions | null>
}

export function getNotificationPermissionsRepository(): NotificationPermissionsRepository {
  return {
    async create(handle, userId, data) {
      const permissions = await handle.notificationPermissions.create({
        data: {
          ...data,
          userId,
        },
      })

      return parseOrReport(NotificationPermissionsSchema, permissions)
    },

    async update(handle, userId, data) {
      const permissions = await handle.notificationPermissions.update({
        where: {
          userId,
        },
        data,
      })

      return parseOrReport(NotificationPermissionsSchema, permissions)
    },

    async findByUserId(handle, userId) {
      const permissions = await handle.notificationPermissions.findUnique({
        where: {
          userId,
        },
      })

      return parseOrReport(NotificationPermissionsSchema, permissions)
    },
  }
}
