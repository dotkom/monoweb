"use client"

import { useTRPC } from "@/utils/trpc/client"
import { useFullPathname } from "@/utils/use-full-pathname"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Text,
  Title,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { IconBell, IconChecks, IconLogin2 } from "@tabler/icons-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSubscription } from "@trpc/tanstack-react-query"
import { NotificationItem } from "./NotificationItem"
import { NotificationPayloadResolver } from "./NotificationPayloadResolver"

type NotificationDropdownProps = {
  isAuthenticated: boolean
}

const triggerClassName =
  "relative flex size-10 items-center justify-center rounded-full transition-colors hover:bg-blue-200 dark:hover:bg-stone-700"

const markAllAsReadLabel = "Merk alle som lest"
const allNotificationsReadLabel = "Alle varslinger er lest"

const contentClassName =
  "flex w-[min(24rem,calc(100vw-2rem))] flex-col overflow-x-hidden overflow-y-hidden rounded-3xl border border-gray-300/70 bg-white p-0 shadow-md dark:border-stone-700 dark:bg-stone-900"

export function NotificationDropdown({ isAuthenticated }: NotificationDropdownProps) {
  if (!isAuthenticated) {
    return <UnauthenticatedNotificationDropdown />
  }

  return <AuthenticatedNotificationDropdown />
}

function AuthenticatedNotificationDropdown() {
  const trpcClient = useTRPC()
  const queryClient = useQueryClient()
  const unreadCountQueryOptions = trpcClient.notification.getMyUnreadCount.queryOptions()
  const notificationsQueryOptions = trpcClient.notification.getMyNotifications.queryOptions({ take: 10 })
  const unreadCountQuery = useQuery(unreadCountQueryOptions)
  const notificationsQuery = useQuery(notificationsQueryOptions)
  const unreadCount = unreadCountQuery.data ?? 0
  const hasUnreadNotifications = unreadCount > 0

  const markAllAsReadMutation = useMutation(
    trpcClient.notification.markAllAsRead.mutationOptions({
      onSuccess: () => {
        queryClient.setQueryData(unreadCountQueryOptions.queryKey, 0)
        queryClient.setQueryData(notificationsQueryOptions.queryKey, (previousNotifications) => {
          if (previousNotifications === undefined) {
            return previousNotifications
          }

          const readAt = new Date()

          return {
            ...previousNotifications,
            items: previousNotifications.items.map((userNotification) => ({
              ...userNotification,
              readAt,
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
            items: previousNotifications.items.map((userNotification) => {
              if (userNotification.notification.id !== variables.notificationId) {
                return userNotification
              }

              return {
                ...userNotification,
                readAt: new Date(),
              }
            }),
          }
        })
      },
    })
  )

  useSubscription(
    trpcClient.notification.onNewNotification.subscriptionOptions(undefined, {
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

          const alreadyExists = previousNotifications.items.some(
            (userNotification) => userNotification.id === newUserNotification.id
          )

          if (alreadyExists) {
            return previousNotifications
          }

          return {
            ...previousNotifications,
            items: [newUserNotification, ...previousNotifications.items].slice(0, 10),
          }
        })
      },
    })
  )

  let triggerAriaLabel = "Åpne varslinger"

  if (hasUnreadNotifications) {
    triggerAriaLabel = `Åpne varslinger, ${unreadCount} uleste`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={triggerAriaLabel} className={triggerClassName}>
          <IconBell className="size-6" />
          {hasUnreadNotifications && (
            <span
              aria-hidden
              className="absolute right-0 top-0 size-3 rounded-full border-2 border-blue-100 bg-red-500 dark:border-stone-800"
            />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={contentClassName} sideOffset={24} positionMethod="fixed">
        <div className="flex shrink-0 items-center justify-between gap-2 px-4 pt-4">
          <Title size="md" className="font-semibold text-gray-900 dark:text-white">
            Varslinger
          </Title>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={!hasUnreadNotifications || markAllAsReadMutation.isPending}
                  onClick={() => markAllAsReadMutation.mutate()}
                  aria-label={hasUnreadNotifications ? markAllAsReadLabel : allNotificationsReadLabel}
                  icon={<IconChecks className="size-4.5" />}
                />
              </span>
            </TooltipTrigger>
            <TooltipContent>{hasUnreadNotifications ? markAllAsReadLabel : allNotificationsReadLabel}</TooltipContent>
          </Tooltip>
        </div>
        <div className="mt-3 max-h-[min(34rem,calc(100dvh-10rem))] min-h-0 space-y-5 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pb-4">
          {notificationsQuery.isPending && (
            <>
              <div className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-stone-800" />
              <div className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-stone-800" />
            </>
          )}
          {notificationsQuery.isError && (
            <Text className="py-8 text-center text-sm text-gray-500 dark:text-stone-400">
              Varslingene kunne ikke lastes inn.
            </Text>
          )}
          {!notificationsQuery.isPending && notificationsQuery.data?.items.length === 0 && (
            <Text className="py-8 text-center text-sm text-gray-500 dark:text-stone-400">
              Du har ingen varslinger ennå.
            </Text>
          )}
          {notificationsQuery.data?.items.map((userNotification) => (
            <NotificationItem
              key={userNotification.id}
              notification={userNotification.notification}
              readAt={userNotification.readAt}
              onInteraction={() => {
                if (userNotification.readAt !== null) {
                  return
                }

                markAsReadMutation.mutate({
                  notificationId: userNotification.notification.id,
                })
              }}
            >
              <NotificationPayloadResolver notification={userNotification.notification} />
            </NotificationItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UnauthenticatedNotificationDropdown() {
  const fullPathname = useFullPathname()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Åpne varslinger" className={triggerClassName}>
          <IconBell className="size-6" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={contentClassName} sideOffset={24} positionMethod="fixed">
        <div className="flex flex-col gap-4 p-4">
          <Title size="md" className="font-semibold text-gray-900 dark:text-white">
            Varslinger
          </Title>
          <Text className="text-sm text-gray-700 dark:text-stone-200">Logg inn for å se varslingene dine.</Text>
          <Button
            element="a"
            variant="default"
            href={createAuthorizeUrl({ returnTo: fullPathname })}
            icon={<IconLogin2 className="size-5" />}
            className="w-fit"
          >
            Logg inn
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
