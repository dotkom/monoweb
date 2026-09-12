import type { Notification } from "@dotkomonline/rpc/notification"

interface NotificationManagementAccess {
  isAdministrator: boolean
  isGroupMember: (groupSlug: string) => boolean
}

export function canManageNotification(notification: Notification, access: NotificationManagementAccess): boolean {
  if (notification.actorGroupId === null) {
    return access.isAdministrator
  }

  return access.isGroupMember(notification.actorGroupId)
}
