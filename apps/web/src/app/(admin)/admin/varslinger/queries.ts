import { useTRPC } from "@admin/lib/trpc-client"
import { isTrpcErrorCode } from "@admin/lib/trpc-errors"
import type {
  NotificationFilterQuery,
  NotificationRecipientFilterQuery,
  NotificationRecipientSelection,
  NotificationType,
  NotificationRecipientPreviewOptions,
} from "@dotkomonline/rpc/notification"
import { keepPreviousData, skipToken, useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useRecipientPreviewInput } from "./use-recipient-preview-input"

export function useRecipientSelectionPreview(
  recipientSelection: NotificationRecipientSelection | null,
  type: NotificationType,
  options?: NotificationRecipientPreviewOptions
) {
  const trpc = useTRPC()
  const { queryInput, isDebouncing, isDisabled } = useRecipientPreviewInput(recipientSelection, type, "", options)

  const query = useQuery({
    ...trpc.notification.previewRecipientSelection.queryOptions(queryInput ?? skipToken),
    retry: false,
  })

  return {
    preview: query.data,
    isPending: isDisabled || isDebouncing || query.isFetching,
    isForbidden: isTrpcErrorCode(query.error, "FORBIDDEN"),
    isError: query.isError,
  }
}

export function useRecipientSelectionPreviewInfinite(
  recipientSelection: NotificationRecipientSelection | null,
  type: NotificationType,
  search = "",
  options?: NotificationRecipientPreviewOptions
) {
  const trpc = useTRPC()
  const { queryInput, isDebouncing, isDisabled } = useRecipientPreviewInput(recipientSelection, type, search, options)

  const { data, ...query } = useInfiniteQuery({
    ...trpc.notification.previewRecipientSelection.infiniteQueryOptions(queryInput ?? skipToken),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    retry: false,
  })

  const recipients = useMemo(() => data?.pages.flatMap((page) => page.sample) ?? [], [data])

  return {
    ...query,
    preview: data?.pages[0],
    recipients,
    isPending: isDisabled || isDebouncing || query.isPending,
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
    select: (data) => data.pages.flatMap((page) => page.items),
  })

  const notifications = useMemo(() => data ?? [], [data])

  return {
    notifications,
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

export function useNotificationRecipientsInfiniteQuery(
  notificationId: string,
  filters: NotificationRecipientFilterQuery,
  enabled = true
) {
  const trpc = useTRPC()
  const queryInput = enabled ? { notificationId, filters } : skipToken
  const { data, ...query } = useInfiniteQuery({
    ...trpc.notification.findRecipients.infiniteQueryOptions(queryInput),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => data.pages.flatMap((page) => page.items),
    placeholderData: keepPreviousData,
    retry: false,
  })

  const recipients = useMemo(() => data ?? [], [data])

  return {
    recipients,
    ...query,
  }
}

export function useNotificationCreatedByQuery(createdById: string | null | undefined) {
  const trpc = useTRPC()
  return useQuery({
    ...trpc.user.get.queryOptions(createdById ?? ""),
    enabled: createdById !== null && createdById !== undefined,
  })
}
