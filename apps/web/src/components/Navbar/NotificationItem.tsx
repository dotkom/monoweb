"use client"

import { Link } from "@/components/link"
import { useCompactRelativeTime } from "@/utils/countdown/use-compact-relative-time"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import {
  getNotificationTypeConfiguration,
  type Notification,
  type NotificationColor,
} from "@dotkomonline/rpc/notification"
import { Button, Text, cn } from "@dotkomonline/ui"
import { IconCheck } from "@tabler/icons-react"
import type { MouseEvent, PropsWithChildren } from "react"

const notificationAccentClasses = {
  blue: "bg-blue-200 dark:bg-blue-400/33",
  purple: "bg-purple-200 dark:bg-purple-400/33",
  green: "bg-green-200 dark:bg-green-400/33",
  red: "bg-red-200 dark:bg-red-400/33",
  gray: "bg-gray-200 dark:bg-stone-500/33",
  yellow: "bg-yellow-200 dark:bg-yellow-400/33",
} as const satisfies Record<NotificationColor, string>

export type NotificationItemNotification = Pick<
  Notification,
  "id" | "createdAt" | "shortDescription" | "title" | "type"
> & {
  actorGroup: Pick<NonNullable<Notification["actorGroup"]>, "abbreviation" | "name" | "preferredDisplayName"> | null
}

type NotificationItemProps = PropsWithChildren<{
  notification: NotificationItemNotification
  readAt: Date | null
  className?: string
  onMarkAsRead?: () => void
  onNavigate?: () => void
}>

export function NotificationItem({
  notification,
  readAt,
  children,
  className,
  onMarkAsRead,
  onNavigate,
}: NotificationItemProps) {
  const isUnread = readAt === null
  const actorGroupName = notification.actorGroup === null ? null : getGroupDisplayName(notification.actorGroup)
  const relativeCreatedAt = useCompactRelativeTime(notification.createdAt)
  const notificationConfiguration = getNotificationTypeConfiguration(notification.type)

  const markAsRead = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    onMarkAsRead?.()
  }

  return (
    <article
      className={cn(
        "group/container relative flex min-w-0 gap-3 rounded-lg p-2 -mx-2",
        "border border-transparent hover:border-gray-200 focus-within:border-gray-200 dark:hover:border-stone-700 dark:focus-within:border-stone-700",
        className
      )}
    >
      <Link
        href={`/varslinger/${notification.id}`}
        aria-label={notification.title}
        onClick={onNavigate}
        className="absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      />

      <span
        aria-hidden
        className={cn(
          "pointer-events-none w-1 shrink-0 self-stretch rounded-full",
          notificationAccentClasses[notificationConfiguration.color]
        )}
      />

      <div className="pointer-events-none relative flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
            <div
              className={cn(
                "inline-flex w-fit min-w-0 max-w-full items-start gap-1.5 rounded-sm",
                isUnread && "bg-yellow-100 dark:bg-yellow-400/10"
              )}
            >
              <Text element="span" className="min-w-0 line-clamp-2 wrap-anywhere text-sm font-medium">
                {notification.title}
              </Text>

              {isUnread && (
                <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-red-500 dark:bg-red-400" />
              )}
            </div>

            <div className="size-6 shrink-0">
              {isUnread && onMarkAsRead !== undefined && (
                <Button
                  variant="outline"
                  size="icon-xs"
                  aria-label="Merk som lest"
                  onClick={markAsRead}
                  className="pointer-events-auto rounded-sm border-gray-200 bg-gray-50 hover:bg-gray-200/70 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 md:opacity-0 md:group-hover/container:opacity-100 md:group-focus-within/container:opacity-100"
                >
                  <IconCheck className="size-3.5" />
                </Button>
              )}
            </div>
          </div>

          <Text className="line-clamp-2 wrap-anywhere text-sm text-muted-foreground">
            {notification.shortDescription}
          </Text>
        </div>

        {children && <div className="pointer-events-auto min-w-0">{children}</div>}

        <div className="flex min-w-0 items-center gap-1.5">
          <Text className="shrink-0 text-xs text-muted-foreground" suppressHydrationWarning>
            {relativeCreatedAt}
          </Text>

          {actorGroupName !== null && (
            <>
              <Text element="span" className="shrink-0 text-xs text-muted-foreground">
                •
              </Text>

              <Text className="min-w-0 truncate text-xs text-muted-foreground">{actorGroupName}</Text>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
