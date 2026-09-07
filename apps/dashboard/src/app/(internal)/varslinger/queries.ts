import { isTrpcErrorCode } from "@/lib/trpc-errors"
import { useTRPC } from "@/lib/trpc-client"
import type { NotificationRecipientSelection, NotificationType } from "@dotkomonline/rpc/notification"
import { useDebouncedValue } from "@mantine/hooks"
import { skipToken, useQuery } from "@tanstack/react-query"

export function useRecipientSelectionPreview(
  recipientSelection: NotificationRecipientSelection | null,
  type: NotificationType
) {
  const trpc = useTRPC()
  const serializedRecipientSelection = recipientSelection === null ? null : JSON.stringify(recipientSelection)
  const [debouncedSerializedRecipientSelection] = useDebouncedValue(serializedRecipientSelection, 400)

  const queryInput =
    debouncedSerializedRecipientSelection === null
      ? skipToken
      : {
          recipientSelection: JSON.parse(debouncedSerializedRecipientSelection) as NotificationRecipientSelection,
          type,
        }

  const query = useQuery({
    ...trpc.notification.previewRecipientSelection.queryOptions(queryInput),
    retry: false,
  })

  const isDebouncing = serializedRecipientSelection !== debouncedSerializedRecipientSelection

  return {
    preview: query.data,
    isPending: serializedRecipientSelection === null || isDebouncing || query.isFetching,
    isForbidden: isTrpcErrorCode(query.error, "FORBIDDEN"),
  }
}
