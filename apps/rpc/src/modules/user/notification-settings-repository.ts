import type { DBHandle } from "@dotkomonline/db"
import {
  type NotificationSettings,
  NotificationSettingsSchema,
  type NotificationSettingsWrite,
  type UserId,
} from "./user"
import { parseOrReport } from "../../invariant"

export interface NotificationSettingsRepository {
  create(handle: DBHandle, userId: UserId, data: NotificationSettingsWrite): Promise<NotificationSettings>
  update(handle: DBHandle, userId: UserId, data: Partial<NotificationSettingsWrite>): Promise<NotificationSettings>
  findByUserId(handle: DBHandle, id: UserId): Promise<NotificationSettings | null>
}

export function getNotificationSettingsRepository(): NotificationSettingsRepository {
  return {
    async create(handle, userId, data) {
      const permissions = await handle.notificationSettings.create({
        data: {
          ...data,
          userId,
        },
      })

      return parseOrReport(NotificationSettingsSchema, permissions)
    },

    async update(handle, userId, data) {
      const permissions = await handle.notificationSettings.update({
        where: {
          userId,
        },
        data,
      })

      return parseOrReport(NotificationSettingsSchema, permissions)
    },

    async findByUserId(handle, userId) {
      const permissions = await handle.notificationSettings.findUnique({
        where: {
          userId,
        },
      })

      return parseOrReport(NotificationSettingsSchema, permissions)
    },
  }
}
