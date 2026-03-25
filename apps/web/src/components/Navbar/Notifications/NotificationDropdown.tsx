import { useEffect, useState, type ComponentProps } from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { NotificationItem, type NotificationItemType } from "./NotificationItem"
import { IconBell, IconLoader2 } from "@tabler/icons-react"
import { cn } from "@dotkomonline/ui"
import { useTRPC } from "@/utils/trpc/client"
import { useQuery } from "@tanstack/react-query"

interface NotificationDropdownProps extends ComponentProps<typeof DropdownMenu.Root> {
  items?: NotificationItemType[]
  hasMoreItems?: boolean
  isLoading?: boolean
  onReadMore?: () => void
}

export const NotificationDropdown = ({
  items = [],
  hasMoreItems = false,
  isLoading,
  onReadMore,
  open,
  ...props
}: NotificationDropdownProps) => {
  const trpc = useTRPC()

  const { data: amountUnread } = useQuery(trpc.notification.getUnreadCount.queryOptions())
  const { data: notifications } = useQuery(
    trpc.notification.getMyNotifications.queryOptions(
      { take: 10 },
      {
        enabled: open,
      }
    )
  )

  const handleMarkAllAsRead = () => {
    console.log("Mark all as read clicked")
  }

  const handleItemClick = (item: NotificationItemType) => {
    // Use to set readAt. The redirection to the item should not happen in this callback.
    console.log("Notification clicked:", item)
  }

  const [infiniteScrollEl, setInfiniteScrollEl] = useState<HTMLDivElement | null>(null)

  // If the bottom div is visible within the scroll container, we attempt to fetch more items.
  // Using a state-based callback ref so the effect re-fires when the portal mounts the element.
  useEffect(() => {
    if (infiniteScrollEl === null) {
      return
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && hasMoreItems) {
        onReadMore?.()
      }
    })
    observer.observe(infiniteScrollEl)
    return () => {
      observer.disconnect()
    }
  }, [infiniteScrollEl, hasMoreItems, onReadMore])

  return (
    <DropdownMenu.Root open={open} {...props}>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="Varslinger"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-blue-200 dark:hover:bg-stone-700 transition-colors"
          type="button"
        >
          <IconBell width={24} height={24} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={5}
          className={cn(
            "animate-in data-[side=right]:slide-in-from-left-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 z-50",
            "w-102 overflow-hidden",
            "rounded-lg shadow-lg",
            "bg-white border border-black/10",
            "dark:border-white/10 dark:bg-stone-800"
          )}
        >
          <div className="p-5 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-black dark:text-white">Varslinger</h3>
              <button
                type="button"
                className="text-brand dark:text-blue-300/80 hover:text-brand/80 dark:hover:text-blue-300/60 text-sm font-semibold transition-colors"
                onClick={handleMarkAllAsRead}
              >
                Marker alle som lest
              </button>
            </div>
            <p className="text-black/60 dark:text-white/60 text-xs tracking-wider font-semibold">SISTE OPPDATERINGER</p>
          </div>

          <div className="max-h-[min(32rem,50vh)] overflow-y-auto">
            {items.length ? (
              <>
                {items.map((item) => (
                  <NotificationItem key={item.id} notification={item} onItemClick={() => handleItemClick(item)} />
                ))}
                {hasMoreItems && <div ref={setInfiniteScrollEl} className="h-px -mt-px" />}
              </>
            ) : (
              !isLoading && <p className="p-6 text-sm text-center text-black/60 dark:text-white/60">Ingen varslinger</p>
            )}
            {isLoading && <IconLoader2 className="animate-spin size-4 mx-auto my-6 text-black/70 dark:text-white/70" />}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
