"use client"

import { Link } from "@/components/link"
import { useCompactRelativeTime } from "@/utils/countdown/use-compact-relative-time"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import type { Notification } from "@dotkomonline/rpc/notification"
import { Text, cn } from "@dotkomonline/ui"
import { IconCheck } from "@tabler/icons-react"
import type { MouseEvent, PropsWithChildren } from "react"

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

  const markAsRead = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    onMarkAsRead?.()
  }

  return (
    <article
      className={cn(
        "group/container relative flex min-w-0 gap-2 rounded-lg p-2 -mx-2",
        "border border-transparent hover:border-gray-200 dark:hover:border-stone-700",
        className
      )}
    >
      <Link
        href={`/varslinger/${notification.id}`}
        aria-label={notification.title}
        onClick={onNavigate}
        className="absolute inset-0 rounded-lg"
      />

      <div className="pointer-events-none relative flex min-w-0 grow flex-col gap-2">
        <div className="flex min-w-0 grow flex-col gap-1">
          <div className="flex w-full min-w-0 items-center gap-1.5">
            <div
              className={cn(
                "inline-flex min-w-0 items-center gap-1.5",
                isUnread &&
                  "rounded-sm px-1.5 pt-1.5 -mx-1.5 -mt-1.5 py-px -mb-px bg-yellow-100 dark:bg-yellow-400/10 group-hover/container:rounded-tl-md"
              )}
            >
              <Text element="span" className="min-w-0 line-clamp-2 text-sm font-semibold">
                {notification.title}
              </Text>

              {isUnread && <span aria-hidden className="size-2 shrink-0 rounded-full bg-red-500 dark:bg-red-400" />}
            </div>

            {isUnread && (
              <button
                type="button"
                aria-label="Merk som lest"
                onClick={markAsRead}
                className="ml-auto shrink-0 rounded-sm p-1 -m-1 border border-gray-200 dark:border-stone-700 opacity-0 pointer-events-none group-hover/container:pointer-events-auto group-hover/container:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 bg-gray-50 hover:bg-gray-200/70 dark:hover:bg-stone-700"
              >
                <IconCheck className="size-3.5" />
              </button>
            )}
          </div>

          <Text className="line-clamp-2 text-sm">{notification.shortDescription}</Text>
        </div>

        {children && <div className="pointer-events-auto min-w-0">{children}</div>}

        <div className="flex min-w-0 flex-row gap-1.5">
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
