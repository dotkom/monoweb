import type { DBHandle } from "@dotkomonline/db"
import type { UserId } from "../user/user"
import {
  type NotificationDeliverySettings,
  NotificationDeliverySettingsSchema,
  type NotificationType,
  NotificationTypeSchema,
} from "./notification"
import { resolveNotificationDeliverySettings } from "./notification-preferences"
import type { NotificationSettingsRepository } from "./notification-settings-repository"

export interface NotificationSettingsService {
  upsert(
    handle: DBHandle,
    userId: UserId,
    settings: NotificationDeliverySettings
  ): Promise<NotificationDeliverySettings>
  getByUserId(handle: DBHandle, userId: UserId): Promise<NotificationDeliverySettings>
  findManyByUserIds(handle: DBHandle, userIds: UserId[]): Promise<Map<UserId, NotificationDeliverySettings>>
  getEnabledNotificationTypes(handle: DBHandle, userId: UserId): Promise<NotificationType[]>
}

export function getNotificationSettingsService(
  notificationSettingsRepository: NotificationSettingsRepository
): NotificationSettingsService {
  return {
    async upsert(handle, userId, settings) {
      const deliverySettings = NotificationDeliverySettingsSchema.parse(settings)
      const permissions = await notificationSettingsRepository.upsert(handle, userId, deliverySettings)

      return resolveNotificationDeliverySettings(permissions)
    },

    async getByUserId(handle, userId) {
      const permissions = await notificationSettingsRepository.findByUserId(handle, userId)

      return resolveNotificationDeliverySettings(permissions)
    },

    async findManyByUserIds(handle, userIds) {
      const permissions = await notificationSettingsRepository.findManyByUserIds(handle, userIds)
      const permissionsByUserId = new Map(permissions.map((permission) => [permission.userId, permission]))
      const settingsByUserId = new Map<UserId, NotificationDeliverySettings>()

      for (const userId of userIds) {
        const settings = resolveNotificationDeliverySettings(permissionsByUserId.get(userId) ?? null)

        settingsByUserId.set(userId, settings)
      }

      return settingsByUserId
    },

    async getEnabledNotificationTypes(handle, userId) {
      const settings = await this.getByUserId(handle, userId)

      return NotificationTypeSchema.options.filter((notificationType) => {
        const delivery = settings[notificationType]

        return delivery.isEnabled
      })
    },
  }
}
