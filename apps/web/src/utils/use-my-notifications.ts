"use client"

import { useTRPC } from "@/utils/trpc/client"
import { useUser } from "@auth0/nextjs-auth0/client"
import { getCurrentUTC } from "@dotkomonline/utils"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSubscription } from "@trpc/tanstack-react-query"

const PAGE_SIZE = 10

export function useMyNotifications({ enableLiveUpdates = false }: { enableLiveUpdates?: boolean } = {}) {
  const trpcClient = useTRPC()
  const queryClient = useQueryClient()
  const { user: sessionUser, isLoading: isSessionLoading } = useUser()
  const isAuthenticated = !isSessionLoading && sessionUser != null

  const unreadCountQueryOptions = trpcClient.notification.getMyUnreadCount.queryOptions(undefined, {
    enabled: isAuthenticated,
  })

  const notificationsQueryOptions = trpcClient.notification.getMyNotifications.infiniteQueryOptions(
    { take: PAGE_SIZE },
    {
      enabled: isAuthenticated,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  const unreadCountQuery = useQuery(unreadCountQueryOptions)
  const notificationsQuery = useInfiniteQuery(notificationsQueryOptions)

  const userNotifications = notificationsQuery.data?.pages.flatMap((page) => page.items) ?? []
  const unreadCount = unreadCountQuery.data ?? 0
  const hasUnreadNotifications = unreadCount > 0
  const hasNoNotifications = !notificationsQuery.isPending && userNotifications.length === 0

  const markAllAsReadMutation = useMutation(
    trpcClient.notification.markAllAsRead.mutationOptions({
      onSuccess: () => {
        queryClient.setQueryData(unreadCountQueryOptions.queryKey, 0)
        queryClient.setQueryData(notificationsQueryOptions.queryKey, (previousNotifications) => {
          if (previousNotifications === undefined) {
            return previousNotifications
          }

          const readAt = getCurrentUTC()

          return {
            ...previousNotifications,
            pages: previousNotifications.pages.map((page) => ({
              ...page,
              items: page.items.map((userNotification) => ({
                ...userNotification,
                readAt,
              })),
            })),
          }
        })
      },
    })
  )

  const markAsReadMutation = useMutation(
    trpcClient.notification.markAsRead.mutationOptions({
      onSuccess: (wasMarkedAsRead, variables) => {
        if (!wasMarkedAsRead) {
          return
        }

        queryClient.setQueryData<number>(unreadCountQueryOptions.queryKey, (previousUnreadCount) => {
          return Math.max((previousUnreadCount ?? 1) - 1, 0)
        })

        queryClient.setQueryData(notificationsQueryOptions.queryKey, (previousNotifications) => {
          if (previousNotifications === undefined) {
            return previousNotifications
          }

          return {
            ...previousNotifications,
            pages: previousNotifications.pages.map((page) => ({
              ...page,
              items: page.items.map((userNotification) => {
                if (userNotification.notification.id !== variables.notificationId) {
                  return userNotification
                }

                return {
                  ...userNotification,
                  readAt: getCurrentUTC(),
                }
              }),
            })),
          }
        })
      },
    })
  )

  useSubscription(
    trpcClient.notification.onNewNotification.subscriptionOptions(undefined, {
      enabled: enableLiveUpdates && isAuthenticated,
      onConnectionStateChange: ({ state }) => {
        if (state !== "pending") {
          return
        }

        void queryClient.invalidateQueries({ queryKey: unreadCountQueryOptions.queryKey })
        void queryClient.invalidateQueries({ queryKey: notificationsQueryOptions.queryKey })
      },
      onData: (newUserNotification) => {
        queryClient.setQueryData<number>(unreadCountQueryOptions.queryKey, (previousUnreadCount) => {
          return (previousUnreadCount ?? 0) + 1
        })

        queryClient.setQueryData(notificationsQueryOptions.queryKey, (previousNotifications) => {
          if (previousNotifications === undefined) {
            return previousNotifications
          }

          const alreadyExists = previousNotifications.pages.some((page) =>
            page.items.some((userNotification) => userNotification.id === newUserNotification.id)
          )

          if (alreadyExists) {
            return previousNotifications
          }

          const [firstPage, ...otherPages] = previousNotifications.pages

          if (firstPage === undefined) {
            return previousNotifications
          }

          return {
            ...previousNotifications,
            pages: [
              {
                ...firstPage,
                items: [newUserNotification, ...firstPage.items],
              },
              ...otherPages,
            ],
          }
        })
      },
    })
  )

  return {
    userNotifications,
    unreadCount,
    hasUnreadNotifications,
    hasNoNotifications,
    notificationsQuery,
    markAllAsReadMutation,
    markAsReadMutation,
  }
}
