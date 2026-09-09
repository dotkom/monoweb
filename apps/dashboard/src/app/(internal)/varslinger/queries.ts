import { isTrpcErrorCode } from "@/lib/trpc-errors"
import { useTRPC } from "@/lib/trpc-client"
import type {
  NotificationFilterQuery,
  NotificationRecipientSelection,
  NotificationType,
} from "@dotkomonline/rpc/notification"
import { useDebouncedValue } from "@mantine/hooks"
import { skipToken, useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

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

export function useNotificationsInfiniteQuery(filters: NotificationFilterQuery = {}) {
  const trpc = useTRPC()
  const { data, ...query } = useInfiniteQuery({
    ...trpc.notification.findMany.infiniteQueryOptions({
      filters,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  return {
    notifications: useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]),
    ...query,
  }
}

export function useNotificationGetQuery(notificationId: string) {
  const trpc = useTRPC()

  return useQuery({
    ...trpc.notification.get.queryOptions(notificationId),
    retry: false,
  })
}

export function useNotificationRecipientStatsQuery(notificationId: string, enabled = true) {
  const trpc = useTRPC()
  const queryInput = enabled ? notificationId : skipToken

  return useQuery({
    ...trpc.notification.getRecipientStats.queryOptions(queryInput),
    retry: false,
  })
}

export function useNotificationRecipientsInfiniteQuery(notificationId: string, enabled = true) {
  const trpc = useTRPC()
  const queryInput = enabled ? { notificationId } : skipToken
  const { data, ...query } = useInfiniteQuery({
    ...trpc.notification.findRecipients.infiniteQueryOptions(queryInput),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    retry: false,
  })

  return {
    recipients: useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]),
    ...query,
  }
}
