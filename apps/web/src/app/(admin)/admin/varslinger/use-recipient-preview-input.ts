"use client"

import {
  NotificationRecipientSelectionSchema,
  type NotificationRecipientSelection,
  type NotificationType,
  type NotificationRecipientPreviewOptions,
} from "@dotkomonline/rpc/notification"
import { useDebounce } from "use-debounce"

const RECIPIENT_SELECTION_DEBOUNCE_MILLISECONDS = 400
const RECIPIENT_SEARCH_DEBOUNCE_MILLISECONDS = 300

export function useRecipientPreviewInput(
  recipientSelection: NotificationRecipientSelection | null,
  type: NotificationType,
  search: string,
  options?: NotificationRecipientPreviewOptions
) {
  const serializedSelection = JSON.stringify(recipientSelection)
  const [debouncedSelection] = useDebounce(serializedSelection, RECIPIENT_SELECTION_DEBOUNCE_MILLISECONDS)
  const trimmedSearch = search.trim()
  const [debouncedSearch] = useDebounce(trimmedSearch, RECIPIENT_SEARCH_DEBOUNCE_MILLISECONDS)
  const selection = NotificationRecipientSelectionSchema.nullable().parse(JSON.parse(debouncedSelection))

  return {
    queryInput:
      recipientSelection === null || selection === null
        ? null
        : {
            recipientSelection: selection,
            type,
            search: debouncedSearch || undefined,
            ...options,
          },
    isDisabled: recipientSelection === null,
    isDebouncing: serializedSelection !== debouncedSelection || trimmedSearch !== debouncedSearch,
  }
}
