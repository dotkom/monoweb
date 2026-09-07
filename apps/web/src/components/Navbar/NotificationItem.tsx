import type { Notification } from "@dotkomonline/rpc/notification"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import { Text, cn } from "@dotkomonline/ui"
import { IconCheck } from "@tabler/icons-react"
import { formatDistanceToNowStrict } from "date-fns"
import { nb } from "date-fns/locale"
import type { MouseEvent, ReactNode } from "react"

export type NotificationItemNotification = Pick<Notification, "createdAt" | "shortDescription" | "title" | "type"> & {
  actorGroup: Pick<NonNullable<Notification["actorGroup"]>, "abbreviation" | "name" | "preferredDisplayName"> | null
}

type NotificationItemProps = {
  notification: NotificationItemNotification
  readAt: Date | null
  children?: ReactNode
  className?: string
  onInteraction?: () => void
}

export function NotificationItem({ notification, readAt, children, className, onInteraction }: NotificationItemProps) {
  const isUnread = readAt === null
  const relativeCreatedAt = formatDistanceToNowStrict(notification.createdAt, {
    addSuffix: true,
    locale: nb,
  })
  const actorGroupName = notification.actorGroup === null ? null : getGroupDisplayName(notification.actorGroup)

  const markAsRead = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    onInteraction?.()
  }

  return (
    <article
      onClickCapture={onInteraction}
      className={cn("group/container flex min-w-0 gap-2 rounded-lg p-2 -mx-2", className)}
    >
      <div className="min-w-0 grow flex flex-col gap-2">
        <div className="min-w-0 grow flex flex-col gap-1">
          <div className="flex w-full min-w-0 items-center gap-1.5">
            <div
              className={cn(
                "inline-flex min-w-0 items-center gap-1.5",
                isUnread && "rounded-sm px-1.5 -mx-1.5 py-px -my-px bg-yellow-100 dark:bg-yellow-400/10"
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

        {children !== undefined && <div className="min-w-0">{children}</div>}

        <div className="flex min-w-0 flex-row gap-1.5">
          <Text className="shrink-0 text-xs text-muted-foreground">{relativeCreatedAt}</Text>

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
