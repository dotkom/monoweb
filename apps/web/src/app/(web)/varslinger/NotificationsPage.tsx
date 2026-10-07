"use client"

import { Link } from "@/components/link"
import { NotificationPayload } from "@/components/Navbar/NotificationPayload"
import { useCompactRelativeTime } from "@/utils/countdown/use-compact-relative-time"
import { useMyNotifications } from "@/utils/use-my-notifications"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import type { UserNotification } from "@dotkomonline/rpc/notification"
import { Button, RichText, Text, Title, cn } from "@dotkomonline/ui"
import { richTextToPlainText } from "@dotkomonline/utils"
import { IconAlertTriangle, IconArrowLeft, IconBellOff, IconChecks } from "@tabler/icons-react"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import { useParams } from "next/navigation"
import { useEffect, useRef } from "react"

export function NotificationsPage() {
  const params = useParams<{ id?: string }>()
  const selectedNotificationId = typeof params.id === "string" ? params.id : undefined
  const {
    userNotifications,
    hasUnreadNotifications,
    hasNoNotifications,
    notificationsQuery,
    markAllAsReadMutation,
    markAsReadMutation,
  } = useMyNotifications()

  const loaderElementReference = useRef<HTMLDivElement>(null)
  const selectedUserNotification = userNotifications.find((userNotification) => {
    return userNotification.notification.id === selectedNotificationId
  })
  const selectedNotificationIdToMark =
    selectedUserNotification !== undefined && selectedUserNotification.readAt === null
      ? selectedUserNotification.notification.id
      : null
  const hasSelection = selectedNotificationId !== undefined

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      if (entry === undefined) {
        return
      }

      if (
        entry.isIntersecting &&
        notificationsQuery.hasNextPage === true &&
        !notificationsQuery.isFetchingNextPage &&
        !notificationsQuery.isLoading
      ) {
        void notificationsQuery.fetchNextPage()
      }
    })

    if (loaderElementReference.current !== null) {
      intersectionObserver.observe(loaderElementReference.current)
    }

    return () => {
      intersectionObserver.disconnect()
    }
  }, [
    notificationsQuery.fetchNextPage,
    notificationsQuery.hasNextPage,
    notificationsQuery.isFetchingNextPage,
    notificationsQuery.isLoading,
  ])

  useEffect(() => {
    if (selectedNotificationIdToMark === null) {
      return
    }

    markAsReadMutation.mutate({ notificationId: selectedNotificationIdToMark })
  }, [markAsReadMutation.mutate, selectedNotificationIdToMark])

  let markAllAsReadAriaLabel = "Alle varslinger er lest"

  if (hasUnreadNotifications) {
    markAllAsReadAriaLabel = "Merk alle som lest"
  } else if (hasNoNotifications) {
    markAllAsReadAriaLabel = "Du har ingen varslinger ennå"
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Title element="h1" className="text-3xl">
          Mine varslinger
        </Title>

        <Button
          variant="outline"
          disabled={!hasUnreadNotifications || markAllAsReadMutation.isPending}
          onClick={() => markAllAsReadMutation.mutate()}
          aria-label={markAllAsReadAriaLabel}
          icon={<IconChecks className="size-5" />}
          className="w-fit"
        >
          Merk alle som lest
        </Button>
      </div>

      <div
        className={cn(
          "flex flex-col",
          "md:h-[calc(100dvh-var(--navbar-height)-10rem)] md:flex-row md:overflow-hidden md:rounded-xl md:border md:border-gray-200 dark:md:border-stone-700"
        )}
      >
        <div
          className={cn(
            "flex min-h-0 flex-col md:w-96 md:shrink-0 md:overflow-y-auto md:border-r md:border-gray-200 dark:md:border-stone-700",
            hasSelection && "max-md:hidden"
          )}
        >
          {notificationsQuery.isPending && (
            <div className="flex flex-col">
              <div className="h-20 animate-pulse border-b border-gray-200 bg-gray-100 dark:border-stone-700 dark:bg-stone-800" />
              <div className="h-20 animate-pulse border-b border-gray-200 bg-gray-100 dark:border-stone-700 dark:bg-stone-800" />
              <div className="h-20 animate-pulse border-b border-gray-200 bg-gray-100 dark:border-stone-700 dark:bg-stone-800" />
            </div>
          )}

          {notificationsQuery.isError && (
            <Text className="px-4 py-8 text-center text-sm text-muted-foreground">
              Varslingene kunne ikke lastes inn.
            </Text>
          )}

          {hasNoNotifications && (
            <Text className="px-4 py-8 text-center text-sm text-muted-foreground">Du har ingen varslinger ennå.</Text>
          )}

          {userNotifications.map((userNotification) => (
            <InboxNotificationRow
              key={userNotification.id}
              userNotification={userNotification}
              isSelected={userNotification.notification.id === selectedNotificationId}
            />
          ))}

          {notificationsQuery.isFetchingNextPage && (
            <div className="h-20 animate-pulse border-b border-gray-200 bg-gray-100 dark:border-stone-700 dark:bg-stone-800" />
          )}

          <div ref={loaderElementReference} className="h-px" aria-hidden />
        </div>

        <div className={cn("min-h-0 min-w-0 flex-1 md:overflow-y-auto", !hasSelection && "max-md:hidden")}>
          <InboxNotificationDetail
            selectedNotificationId={selectedNotificationId}
            selectedUserNotification={selectedUserNotification}
            isPending={notificationsQuery.isPending}
            isError={notificationsQuery.isError}
            hasNoNotifications={hasNoNotifications}
          />
        </div>
      </div>
    </div>
  )
}

function InboxNotificationRow({
  userNotification,
  isSelected,
}: {
  userNotification: UserNotification
  isSelected: boolean
}) {
  const isUnread = userNotification.readAt === null
  const relativeCreatedAt = useCompactRelativeTime(userNotification.notification.createdAt)

  return (
    <Link
      href={`/varslinger/${userNotification.notification.id}`}
      aria-current={isSelected ? "page" : undefined}
      className={cn(
        "flex gap-3 border-b border-gray-200 px-4 py-3 transition-colors dark:border-stone-700",
        "hover:bg-gray-50 dark:hover:bg-stone-800",
        isUnread && "bg-yellow-50/70 hover:bg-yellow-50 dark:bg-yellow-400/5 dark:hover:bg-yellow-400/10",
        isSelected && "bg-blue-50 hover:bg-blue-50 dark:bg-stone-800 dark:hover:bg-stone-800"
      )}
    >
      <div className="flex w-2 shrink-0 items-start pt-1.5">
        {isUnread && <span aria-hidden className="size-2 rounded-full bg-red-500 dark:bg-red-400" />}
      </div>

      <div className="min-w-0 grow">
        <div className="flex items-start justify-between gap-3">
          <Text
            element="span"
            className={cn("min-w-0 line-clamp-1 text-sm", isUnread ? "font-semibold" : "font-medium")}
          >
            {userNotification.notification.title}
          </Text>

          <Text className="shrink-0 text-xs text-muted-foreground" suppressHydrationWarning>
            {relativeCreatedAt}
          </Text>
        </div>

        <Text className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-stone-300">
          {userNotification.notification.shortDescription}
        </Text>
      </div>
    </Link>
  )
}

function InboxNotificationDetail({
  selectedNotificationId,
  selectedUserNotification,
  isPending,
  isError,
  hasNoNotifications,
}: {
  selectedNotificationId?: string
  selectedUserNotification?: UserNotification
  isPending: boolean
  isError: boolean
  hasNoNotifications: boolean
}) {
  if (isPending && selectedNotificationId !== undefined) {
    return (
      <div className="flex flex-col gap-4 md:p-6">
        <div className="h-8 w-2/3 animate-pulse rounded-md bg-gray-100 dark:bg-stone-800" />
        <div className="h-4 w-40 animate-pulse rounded-md bg-gray-100 dark:bg-stone-800" />
        <div className="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-stone-800" />
      </div>
    )
  }

  if (selectedNotificationId === undefined) {
    if (isError) {
      return (
        <div
          role="status"
          aria-label="Varslingene kunne ikke lastes inn."
          className="hidden h-full items-center justify-center md:flex md:px-6 py-16"
        >
          <IconAlertTriangle aria-hidden className="size-10 text-muted-foreground" />
        </div>
      )
    }

    if (hasNoNotifications) {
      return (
        <div
          role="status"
          aria-label="Du har ingen varslinger ennå."
          className="hidden h-full items-center justify-center md:flex md:px-6 py-16"
        >
          <IconBellOff aria-hidden className="size-10 text-muted-foreground" />
        </div>
      )
    }

    return (
      <div className="flex h-full items-center justify-center md:px-6 py-16">
        <Text className="text-center text-sm text-muted-foreground">Velg en varsling for å lese den.</Text>
      </div>
    )
  }

  if (selectedUserNotification === undefined) {
    return (
      <div className="flex h-full flex-col gap-4 md:p-6">
        <MobileInboxBackLink />
        <Text className="text-sm text-muted-foreground">Varslingen ble ikke funnet.</Text>
      </div>
    )
  }

  const notification = selectedUserNotification.notification
  const actorGroupName = notification.actorGroup === null ? null : getGroupDisplayName(notification.actorGroup)
  const hasFullDescription = richTextToPlainText(notification.content, null).trim().length > 0
  const formattedCreatedAt = formatDate(notification.createdAt, "d. MMMM yyyy 'kl.' HH:mm", { locale: nb })

  return (
    <article className="flex flex-col gap-6 md:p-6">
      <MobileInboxBackLink />

      <div className="flex flex-col gap-2">
        <Title element="h2" size="lg">
          {notification.title}
        </Title>

        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
          <Text className="text-sm text-muted-foreground">{formattedCreatedAt}</Text>

          {actorGroupName !== null && (
            <>
              <Text element="span" className="text-sm text-muted-foreground">
                •
              </Text>
              <Text className="text-sm text-muted-foreground">{actorGroupName}</Text>
            </>
          )}
        </div>
      </div>

      {hasFullDescription ? (
        <RichText content={notification.content} className="max-w-none" />
      ) : (
        <Text>{notification.shortDescription}</Text>
      )}

      <NotificationPayload notification={notification} />
    </article>
  )
}

function MobileInboxBackLink() {
  return (
    <Button
      element={Link}
      href="/varslinger"
      variant="ghost"
      icon={<IconArrowLeft className="size-5" />}
      className="w-fit md:hidden"
    >
      Tilbake
    </Button>
  )
}
