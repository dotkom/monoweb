"use client"

import type { NotificationManagement } from "@dotkomonline/rpc/notification"
import { createContext, useContext } from "react"

export const NotificationDetailsContext = createContext<{
  notification: NotificationManagement
} | null>(null)

export function useNotificationDetailsContext() {
  const context = useContext(NotificationDetailsContext)

  if (context === null) {
    throw new Error("useNotificationDetailsContext called without Provider in tree")
  }

  return context
}
