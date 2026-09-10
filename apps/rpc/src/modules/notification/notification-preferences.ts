import type { NotificationPermissionsWrite } from "../user/user"
import type { NotificationType } from "./notification"

export type NotificationPermissionField = keyof Pick<
  NotificationPermissionsWrite,
  "applications" | "newArticles" | "standardNotifications" | "groupMessages" | "markRulesUpdates" | "registrationStart"
>

const ALWAYS = "ALWAYS"

const PREFERENCE_FIELD_BY_NOTIFICATION_TYPE = {
  BROADCAST: "standardNotifications",
  BROADCAST_IMPORTANT: ALWAYS,
  EVENT_REGISTRATION: "registrationStart",
  EVENT_REMINDER: "standardNotifications",
  EVENT_UPDATE: "standardNotifications",
  JOB_LISTING_REMINDER: "applications",
  NEW_ARTICLE: "newArticles",
  NEW_EVENT: "standardNotifications",
  NEW_FEEDBACK_FORM: ALWAYS,
  NEW_INTEREST_GROUP: "groupMessages",
  NEW_JOB_LISTING: "applications",
  NEW_MARK: ALWAYS,
  NEW_OFFLINE: "standardNotifications",
} as const satisfies Record<NotificationType, NotificationPermissionField | typeof ALWAYS>

/**
 * Return the user preference field that gates this notification type, or null if it cannot be opted out of.
 */
export function getNotificationPermissionField(notificationType: NotificationType): NotificationPermissionField | null {
  const permissionField = PREFERENCE_FIELD_BY_NOTIFICATION_TYPE[notificationType]

  if (permissionField === ALWAYS) {
    return null
  }

  return permissionField
}
