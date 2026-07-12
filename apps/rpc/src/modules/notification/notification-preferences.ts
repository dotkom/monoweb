import type { NotificationPermissionsWrite } from "../user/user"
import type { NotificationType } from "./notification"

export type NotificationPermissionField = keyof Pick<
  NotificationPermissionsWrite,
  | "applications"
  | "newArticles"
  | "standardNotifications"
  | "groupMessages"
  | "markRulesUpdates"
  | "registrationStart"
>

const notificationTypePermissionMap = {
  NEW_ARTICLE: "newArticles",
  NEW_MARK: "markRulesUpdates",
  NEW_INTEREST_GROUP: "groupMessages",
  EVENT_REGISTRATION: "registrationStart",
  JOB_LISTING_REMINDER: "applications",
  NEW_JOB_LISTING: "applications",
  NEW_EVENT: "standardNotifications",
  EVENT_REMINDER: "standardNotifications",
  EVENT_UPDATE: "standardNotifications",
  NEW_OFFLINE: "standardNotifications",
  NEW_FEEDBACK_FORM: "standardNotifications",
  BROADCAST: "standardNotifications",
} as const satisfies Partial<Record<NotificationType, NotificationPermissionField>>

export function getNotificationPermissionField(notificationType: NotificationType): NotificationPermissionField {
  const permissionField = notificationTypePermissionMap[notificationType as keyof typeof notificationTypePermissionMap]

  if (permissionField !== undefined) {
    return permissionField
  }

  return "standardNotifications"
}

export function shouldBypassNotificationPreferences(notificationType: NotificationType): boolean {
  return notificationType === "BROADCAST_IMPORTANT"
}
