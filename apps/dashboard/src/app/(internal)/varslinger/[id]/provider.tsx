"use client"

import type { Notification } from "@dotkomonline/types"
import { createContext, useContext } from "react"

export const NotificationDetailsContext = createContext<{
  notification: Notification
} | null>(null)

export const useNotificationDetailsContext = () => {
  const ctx = useContext(NotificationDetailsContext)
  if (ctx === null) {
    throw new Error("useNotificationDetailsContext called without Provider in tree")
  }
  return ctx
}
