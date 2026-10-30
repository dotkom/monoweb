"use client"

import type { NotificationMessage } from "@dotkomonline/rpc/notification"
import { useCallback, useState } from "react"

function getMessageKey(message: NotificationMessage): string {
  return JSON.stringify([message.title, message.shortDescription, message.content])
}

export function useNotificationMessageDraft(savedMessage: NotificationMessage) {
  const savedMessageKey = getMessageKey(savedMessage)
  const [editor, setEditor] = useState(() => ({ savedMessageKey, draft: savedMessage }))
  const hasUnsavedChanges = getMessageKey(editor.draft) !== editor.savedMessageKey

  if (savedMessageKey !== editor.savedMessageKey) {
    setEditor({ savedMessageKey, draft: hasUnsavedChanges ? editor.draft : savedMessage })
  }

  const setDraft = useCallback((draft: NotificationMessage) => setEditor((previous) => ({ ...previous, draft })), [])

  return { draft: editor.draft, setDraft, hasUnsavedChanges: getMessageKey(editor.draft) !== savedMessageKey }
}
