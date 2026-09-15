import { isTrpcErrorCode } from "@/lib/trpc-errors"
import { useTRPC } from "@/lib/trpc-client"
import {
  type NotificationRecipientSelection,
  NotificationRecipientSelectionSchema,
  type NotificationType,
} from "@dotkomonline/rpc/notification"
import { useDebouncedValue } from "@mantine/hooks"
import { skipToken, useQuery } from "@tanstack/react-query"

const PREVIEW_DEBOUNCE_MS = 400

function serializeRecipientSelection(recipientSelection: NotificationRecipientSelection | null): string | null {
  if (recipientSelection === null) {
    return null
  }

  return JSON.stringify(recipientSelection)
}

function parseSerializedRecipientSelection(
  serializedRecipientSelection: string | null
): NotificationRecipientSelection | null {
  if (serializedRecipientSelection === null) {
    return null
  }

  const parsedJson: unknown = JSON.parse(serializedRecipientSelection)
  const parsedRecipientSelection = NotificationRecipientSelectionSchema.safeParse(parsedJson)

  if (!parsedRecipientSelection.success) {
    return null
  }

  return parsedRecipientSelection.data
}

function getPreviewInput(recipientSelection: NotificationRecipientSelection | null, type: NotificationType) {
  if (recipientSelection === null) {
    return skipToken
  }

  return { recipientSelection, type }
}

export function useRecipientSelectionPreview(
  recipientSelection: NotificationRecipientSelection | null,
  type: NotificationType
) {
  const trpc = useTRPC()
  const serializedRecipientSelection = serializeRecipientSelection(recipientSelection)
  const [debouncedSerializedRecipientSelection] = useDebouncedValue(serializedRecipientSelection, PREVIEW_DEBOUNCE_MS)
  const parsedRecipientSelection = parseSerializedRecipientSelection(debouncedSerializedRecipientSelection)
  const previewInput = getPreviewInput(parsedRecipientSelection, type)

  const query = useQuery({
    ...trpc.notification.previewRecipientSelection.queryOptions(previewInput),
    retry: false,
  })

  const isDebouncing = serializedRecipientSelection !== debouncedSerializedRecipientSelection
  const isForbidden = isTrpcErrorCode(query.error, "FORBIDDEN")

  return {
    preview: query.data,
    isPending: serializedRecipientSelection === null || isDebouncing || query.isFetching,
    isForbidden,
  }
}
