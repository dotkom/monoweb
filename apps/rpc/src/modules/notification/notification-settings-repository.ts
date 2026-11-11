import type { DBHandle } from "@dotkomonline/db"
import { parseOrReport } from "../../invariant"
import { type NotificationSettings, NotificationSettingsSchema, type UserId } from "../user/user"
import type { NotificationDeliverySettings } from "./notification"

export interface NotificationSettingsRepository {
  upsert(
    handle: DBHandle,
    userId: UserId,
    deliverySettings: NotificationDeliverySettings
  ): Promise<NotificationSettings>
  findByUserId(handle: DBHandle, userId: UserId): Promise<NotificationSettings | null>
  findManyByUserIds(handle: DBHandle, userIds: UserId[]): Promise<NotificationSettings[]>
}

export function getNotificationSettingsRepository(): NotificationSettingsRepository {
  return {
    async upsert(handle, userId, deliverySettings) {
      const permissions = await handle.notificationSettings.upsert({
        where: {
          userId,
        },
        create: {
          userId,
          deliverySettings,
        },
        update: {
          deliverySettings,
        },
      })

      return parseOrReport(NotificationSettingsSchema, permissions)
    },

    async findByUserId(handle, userId) {
      const permissions = await handle.notificationSettings.findUnique({
        where: {
          userId,
        },
      })

      return parseOrReport(NotificationSettingsSchema.nullable(), permissions)
    },

    async findManyByUserIds(handle, userIds) {
      const permissions = await handle.notificationSettings.findMany({
        where: {
          userId: {
            in: userIds,
          },
        },
      })

      return parseOrReport(NotificationSettingsSchema.array(), permissions)
    },
  }
}
