import { useEffect, useState, type ComponentProps } from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { NotificationItem } from "./NotificationItem"
import { IconBell, IconLoader2 } from "@tabler/icons-react"
import { Button, cn, Text, Title } from "@dotkomonline/ui"
import { useTRPC } from "@/utils/trpc/client"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { UserNotificationDTO } from "@dotkomonline/rpc"
import { useSubscription } from "@trpc/tanstack-react-query"

interface NotificationDropdownProps extends ComponentProps<typeof DropdownMenu.Root> {
  open?: boolean
  amountUnread?: number
}

export const NotificationDropdown = ({ open, amountUnread, ...props }: NotificationDropdownProps) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  useSubscription(
    trpc.notification.onNewNotification.subscriptionOptions(undefined, {
      onData: () => {
        queryClient.invalidateQueries(trpc.notification.getUnreadCount.queryOptions())
        queryClient.invalidateQueries({
          queryKey: trpc.notification.getMyNotifications.infiniteQueryOptions({ take: 10 }).queryKey,
        })
      },
    })
  )

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    ...trpc.notification.getMyNotifications.infiniteQueryOptions({ take: 10 }),
    enabled: open,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const markAllAsReadMutation = useMutation(
    trpc.notification.markAllAsRead.mutationOptions({
      onSuccess: async () => {
        // Invalidate queries to refetch notifications and unread count
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.notification.getMyNotifications.infiniteQueryOptions({ take: 10 }).queryKey,
          }),
          queryClient.invalidateQueries(trpc.notification.getUnreadCount.queryOptions()),
        ])
      },
    })
  )

  const markAsReadMutation = useMutation(
    trpc.notification.markAsRead.mutationOptions({
      onSuccess: async () => {
        // Invalidate queries to refetch notifications and unread count
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.notification.getMyNotifications.infiniteQueryOptions({ take: 10 }).queryKey,
          }),
          queryClient.invalidateQueries(trpc.notification.getUnreadCount.queryOptions()),
        ])
      },
    })
  )

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const handleItemClick = (item: UserNotificationDTO) => {
    // Use to set readAt. The redirection to the item should not happen in this callback.
    if (!item.readAt) {
      markAsReadMutation.mutate({ notificationId: item.notification.id })
    }
  }

  const [infiniteScrollEl, setInfiniteScrollEl] = useState<HTMLDivElement | null>(null)

  // If the bottom div is visible within the scroll container, we attempt to fetch more items.
  // Using a state-based callback ref so the effect re-fires when the portal mounts the element.
  useEffect(() => {
    if (infiniteScrollEl === null) {
      return
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    })
    observer.observe(infiniteScrollEl)
    return () => {
      observer.disconnect()
    }
  }, [infiniteScrollEl, hasNextPage, isFetchingNextPage, fetchNextPage])

  const notifications = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <DropdownMenu.Root open={open} {...props}>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="Varslinger"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-blue-200 dark:hover:bg-stone-700 transition-colors relative"
          type="button"
        >
          <IconBell width={24} height={24} />
          {amountUnread !== undefined && amountUnread > 0 && (
            <Text
              element="span"
              className={cn(
                "absolute -top-0.5 -right-0.5 flex items-center justify-center h-4.5 min-w-4.5 w-fit px-1 rounded-full",
                "bg-red-500 ring-2 ring-blue-100 dark:ring-stone-800 text-white text-[11px]"
              )}
            >
              {amountUnread > 99 ? "99+" : amountUnread}
            </Text>
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={24}
          className={cn(
            "animate-in data-[side=right]:slide-in-from-left-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 z-50",
            "rounded-3xl shadow-sm p-6",
            "bg-blue-50 border border-blue-100",
            "dark:border-white/10 dark:bg-stone-800"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <Title size="md" element="h2">
              Varslinger
            </Title>
            <Button variant="ghost" onClick={handleMarkAllAsRead}>
              Marker alle som lest
            </Button>
          </div>

          <div className="max-h-[min(32rem,50vh)] overflow-y-auto">
            {notifications.length ? (
              <>
                {notifications.map((item) => (
                  <NotificationItem key={item.id} userNotification={item} onItemClick={() => handleItemClick(item)} />
                ))}
                {hasNextPage && <div ref={setInfiniteScrollEl} className="h-px -mt-px" />}
              </>
            ) : (
              !isLoading && <p className="p-6 text-sm text-center text-black/60 dark:text-white/60">Ingen varslinger</p>
            )}
            {(isLoading || isFetchingNextPage) && (
              <IconLoader2 className="animate-spin size-4 mx-auto my-6 text-black/70 dark:text-white/70" />
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
