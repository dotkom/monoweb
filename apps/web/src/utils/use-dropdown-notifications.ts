"use client"

import { useState } from "react"

export function useDropdownNotifications<Notification extends { id: string; readAt: Date | null }>(
  userNotifications: Notification[]
) {
  const [retainedNotificationIds, setRetainedNotificationIds] = useState<Set<string>>(() => new Set())
  const newUnreadNotifications = userNotifications.filter((userNotification) => {
    return userNotification.readAt === null && !retainedNotificationIds.has(userNotification.id)
  })

  // Keep notifications that were unread during this opening, including newly fetched or received items.
  if (newUnreadNotifications.length > 0) {
    setRetainedNotificationIds(
      new Set([...retainedNotificationIds, ...newUnreadNotifications.map((userNotification) => userNotification.id)])
    )
  }

  return userNotifications.filter((userNotification) => {
    return userNotification.readAt === null || retainedNotificationIds.has(userNotification.id)
  })
}
