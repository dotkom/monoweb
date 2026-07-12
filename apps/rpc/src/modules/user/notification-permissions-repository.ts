import type { DBHandle } from "@dotkomonline/db"
import {
  type NotificationPermissions,
  NotificationPermissionsSchema,
  type NotificationPermissionsWrite,
  type UserId,
} from "./user"
import { parseOrReport } from "../../invariant"
import type { NotificationPermissionField } from "../notification/notification-preferences"

export interface NotificationPermissionsRepository {
  create(handle: DBHandle, userId: UserId, data: NotificationPermissionsWrite): Promise<NotificationPermissions>
  update(
    handle: DBHandle,
    userId: UserId,
    data: Partial<NotificationPermissionsWrite>
  ): Promise<NotificationPermissions>
  findByUserId(handle: DBHandle, id: UserId): Promise<NotificationPermissions | null>
  findUserIdsWithPreferenceEnabled(handle: DBHandle, permissionField: NotificationPermissionField): Promise<UserId[]>
  filterUserIdsByPreference(
    handle: DBHandle,
    userIds: UserId[],
    permissionField: NotificationPermissionField
  ): Promise<UserId[]>
  findAllUserIds(handle: DBHandle): Promise<UserId[]>
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

    async findUserIdsWithPreferenceEnabled(handle, permissionField) {
      const users = await handle.user.findMany({
        where: {
          OR: [{ notificationPermissions: null }, { notificationPermissions: { [permissionField]: true } }],
        },
        select: { id: true },
      })

      return users.map((user) => user.id)
    },

    async filterUserIdsByPreference(handle, userIds, permissionField) {
      if (userIds.length === 0) {
        return []
      }

      const users = await handle.user.findMany({
        where: {
          id: { in: userIds },
          OR: [{ notificationPermissions: null }, { notificationPermissions: { [permissionField]: true } }],
        },
        select: { id: true },
      })

      return users.map((user) => user.id)
    },

    async findAllUserIds(handle) {
      const users = await handle.user.findMany({
        select: { id: true },
      })

      return users.map((user) => user.id)
    },
  }
}
