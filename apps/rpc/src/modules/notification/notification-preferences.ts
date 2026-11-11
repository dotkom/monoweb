import { z } from "zod"
import {
  DEFAULT_NOTIFICATION_DELIVERY,
  NotificationDeliverySchema,
  type NotificationDeliverySettings,
  NotificationTypeSchema,
  REQUIRED_NOTIFICATION_TYPES,
} from "./notification"

const StoredNotificationDeliverySettingsSchema = z.partialRecord(
  NotificationTypeSchema,
  NotificationDeliverySchema.partial()
)

export function resolveNotificationDeliverySettings(
  permissions: { deliverySettings?: unknown } | null
): NotificationDeliverySettings {
  const settings: NotificationDeliverySettings = { ...DEFAULT_NOTIFICATION_DELIVERY }
  const storedSettings = StoredNotificationDeliverySettingsSchema.parse(permissions?.deliverySettings ?? {})

  for (const notificationType of NotificationTypeSchema.options) {
    const delivery = {
      ...DEFAULT_NOTIFICATION_DELIVERY[notificationType],
      ...storedSettings[notificationType],
    }

    if (REQUIRED_NOTIFICATION_TYPES.includes(notificationType)) {
      delivery.isEnabled = true
    }

    settings[notificationType] = delivery
  }

  return settings
}
