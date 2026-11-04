"use client"

import type { NotificationRecipientSelection } from "@dotkomonline/rpc/notification"
import { useState } from "react"
import {
  createRecipientSelectionDraft,
  getRecipientSelection,
  getRecipientSelectionKey,
  hasIncompleteRecipientRules,
  type RecipientSelectionDraft,
} from "./recipient-selection-draft"

export function useRecipientSelectionDraft(savedSelection: NotificationRecipientSelection | null) {
  const savedSelectionKey = getRecipientSelectionKey(savedSelection)

  const [editor, setEditor] = useState(() => ({
    savedSelectionKey,
    draft: createRecipientSelectionDraft(savedSelection),
  }))

  const recipientSelection = getRecipientSelection(editor.draft)

  const hasIncompleteRules = hasIncompleteRecipientRules(editor.draft)
  const hasUnsavedChanges =
    hasIncompleteRules || getRecipientSelectionKey(recipientSelection) !== editor.savedSelectionKey

  // Accept remote updates when clean, while preserving local edits during refetches and saves.
  if (editor.savedSelectionKey !== savedSelectionKey) {
    setEditor({
      savedSelectionKey,
      draft: hasUnsavedChanges ? editor.draft : createRecipientSelectionDraft(savedSelection),
    })
  }

  const setDraft = (draft: RecipientSelectionDraft) => setEditor((previous) => ({ ...previous, draft }))

  return {
    draft: editor.draft,
    setDraft,
    recipientSelection,
    hasIncompleteRules,
    hasUnsavedChanges: hasIncompleteRules || getRecipientSelectionKey(recipientSelection) !== savedSelectionKey,
  }
}
