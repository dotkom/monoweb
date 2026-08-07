"use client"

import { createContext, useContext } from "react"
import type { Notification } from "@dotkomonline/rpc"

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
