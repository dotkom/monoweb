"use client"

import { Link } from "@/components/link"
import { useFullPathname } from "@/utils/use-full-pathname"
import { useMyNotifications } from "@/utils/use-my-notifications"
import type { UserNotification } from "@dotkomonline/rpc/notification"
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
import { useEffect, useRef, useState } from "react"
import { NotificationItem } from "./NotificationItem"
import { NotificationPayload } from "./NotificationPayload"

const triggerClassName =
  "relative flex size-10 items-center justify-center rounded-full transition-colors hover:bg-blue-200 dark:hover:bg-stone-700"

const contentClassName =
  "flex w-[min(24rem,calc(100vw-2rem))] max-h-[min(34rem,calc(100dvh-var(--navbar-height)-5rem))] flex-col overflow-hidden rounded-3xl border border-gray-300/70 bg-white p-0 shadow-md dark:border-stone-700 dark:bg-stone-900"

export function NotificationDropdown({ isAuthenticated }: { isAuthenticated: boolean }) {
  if (!isAuthenticated) {
    return <UnauthenticatedNotificationDropdown />
  }

  return <AuthenticatedNotificationDropdown />
}

function AuthenticatedNotificationDropdown() {
  const {
    userNotifications,
    unreadCount,
    hasUnreadNotifications,
    hasNoNotifications,
    notificationsQuery,
    markAllAsReadMutation,
    markAsReadMutation,
  } = useMyNotifications({ enableLiveUpdates: true })
  const [isOpen, setIsOpen] = useState(false)

  let triggerAriaLabel = "Åpne varslinger"

  if (hasUnreadNotifications) {
    triggerAriaLabel = `Åpne varslinger, ${unreadCount} uleste`
  }

  let markAllAsReadTooltip = "Alle varslinger er lest"

  if (hasUnreadNotifications) {
    markAllAsReadTooltip = "Merk alle som lest"
  } else if (hasNoNotifications) {
    markAllAsReadTooltip = "Du har ingen varslinger ennå"
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
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
                  variant="ghost"
                  size="icon-sm"
                  disabled={!hasUnreadNotifications || markAllAsReadMutation.isPending}
                  onClick={() => markAllAsReadMutation.mutate()}
                  aria-label={markAllAsReadTooltip}
                  icon={<IconChecks className="size-4.5" />}
                />
              </span>
            </TooltipTrigger>
            <TooltipContent>{markAllAsReadTooltip}</TooltipContent>
          </Tooltip>
        </div>

        <NotificationScrollList
          userNotifications={userNotifications}
          isPending={notificationsQuery.isPending}
          isError={notificationsQuery.isError}
          isFetchingNextPage={notificationsQuery.isFetchingNextPage}
          isLoading={notificationsQuery.isLoading}
          hasNextPage={notificationsQuery.hasNextPage === true}
          hasNoNotifications={hasNoNotifications}
          onFetchNextPage={() => {
            void notificationsQuery.fetchNextPage()
          }}
          onMarkAsRead={(notificationId) => markAsReadMutation.mutate({ notificationId })}
          onNavigate={() => setIsOpen(false)}
        />

        <div className="shrink-0 border-t border-gray-200 px-2 pb-2 pt-1.5 dark:border-stone-700">
          <Button element={Link} href="/varslinger" variant="ghost" className="h-8 w-full rounded-b-xl rounded-t-xs">
            Se alle varslinger
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotificationScrollList({
  userNotifications,
  isPending,
  isError,
  isFetchingNextPage,
  isLoading,
  hasNextPage,
  hasNoNotifications,
  onFetchNextPage,
  onMarkAsRead,
  onNavigate,
}: {
  userNotifications: UserNotification[]
  isPending: boolean
  isError: boolean
  isFetchingNextPage: boolean
  isLoading: boolean
  hasNextPage: boolean
  hasNoNotifications: boolean
  onFetchNextPage: () => void
  onMarkAsRead: (notificationId: string) => void
  onNavigate: () => void
}) {
  const loaderElementReference = useRef<HTMLDivElement>(null)
  const scrollParentElementReference = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry === undefined) {
          return
        }

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage && !isLoading) {
          onFetchNextPage()
        }
      },
      {
        root: scrollParentElementReference.current,
        rootMargin: "200px 0px",
        threshold: 0,
      }
    )

    if (loaderElementReference.current !== null) {
      intersectionObserver.observe(loaderElementReference.current)
    }

    return () => {
      intersectionObserver.disconnect()
    }
  }, [onFetchNextPage, hasNextPage, isFetchingNextPage, isLoading])

  return (
    <div
      ref={scrollParentElementReference}
      className="mt-3 min-h-0 flex-1 space-y-5 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pb-4"
    >
      {isPending && (
        <>
          <div className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-stone-800" />
          <div className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-stone-800" />
        </>
      )}

      {isError && (
        <Text className="py-8 text-center text-sm text-muted-foreground">Varslingene kunne ikke lastes inn.</Text>
      )}

      {hasNoNotifications && (
        <Text className="py-8 text-center text-sm text-muted-foreground">Du har ingen varslinger ennå.</Text>
      )}

      {userNotifications.map((userNotification) => {
        const hasPayload = userNotification.notification.link.type !== "NONE"
        let payload = null

        if (hasPayload) {
          payload = <NotificationPayload notification={userNotification.notification} />
        }

        return (
          <NotificationItem
            key={userNotification.id}
            notification={userNotification.notification}
            readAt={userNotification.readAt}
            onMarkAsRead={() => {
              if (userNotification.readAt !== null) {
                return
              }

              onMarkAsRead(userNotification.notification.id)
            }}
            onNavigate={onNavigate}
            className="last-of-type:-mb-2"
          >
            {payload}
          </NotificationItem>
        )
      })}

      {isFetchingNextPage && <div className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-stone-800" />}

      <div ref={loaderElementReference} className="h-px mt-0!" aria-hidden />
    </div>
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
