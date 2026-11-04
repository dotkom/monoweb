"use client"

import type {
  NotificationManagement,
  NotificationRecipientSelection,
  NotificationMessage,
} from "@dotkomonline/rpc/notification"
import { createContext, useContext, type PropsWithChildren } from "react"
import { useRecipientSelectionDraft } from "../components/recipient-selection/use-recipient-selection-draft"
import type { RecipientSelectionDraft } from "../components/recipient-selection/recipient-selection-draft"
import { useNotificationMessageDraft } from "../use-notification-message-draft"

const NotificationDetailsContext = createContext<{
  notification: NotificationManagement
  recipientSelection: NotificationRecipientSelection | null
  recipientSelectionDraft: RecipientSelectionDraft
  setRecipientSelectionDraft: (draft: RecipientSelectionDraft) => void
  hasIncompleteRecipientRules: boolean
  hasUnsavedRecipients: boolean
  hasUnsavedContent: boolean
  contentDraft: NotificationMessage
  setContentDraft: (content: NotificationMessage) => void
} | null>(null)

export function NotificationDetailsProvider({
  notification,
  children,
}: PropsWithChildren<{ notification: NotificationManagement }>) {
  const recipientEditor = useRecipientSelectionDraft(notification.draftRecipientSelection)
  const messageEditor = useNotificationMessageDraft({
    title: notification.title,
    content: notification.content,
    shortDescription: notification.shortDescription,
  })

  return (
    <NotificationDetailsContext.Provider
      value={{
        notification,
        recipientSelection: recipientEditor.recipientSelection,
        recipientSelectionDraft: recipientEditor.draft,
        setRecipientSelectionDraft: recipientEditor.setDraft,
        hasIncompleteRecipientRules: recipientEditor.hasIncompleteRules,
        hasUnsavedRecipients: recipientEditor.hasUnsavedChanges,
        hasUnsavedContent: messageEditor.hasUnsavedChanges,
        contentDraft: messageEditor.draft,
        setContentDraft: messageEditor.setDraft,
      }}
    >
      {children}
    </NotificationDetailsContext.Provider>
  )
}

export function useNotificationDetailsContext() {
  const context = useContext(NotificationDetailsContext)

  if (context === null) {
    throw new Error("useNotificationDetailsContext called without Provider in tree")
  }

  return context
}
