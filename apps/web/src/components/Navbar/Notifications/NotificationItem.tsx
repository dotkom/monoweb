import {
  IconBookFilled,
  IconBriefcaseFilled,
  IconCalendarExclamation,
  IconCalendarPlus,
  IconCalendarTime,
  IconCalendarUp,
  IconMessageCircleFilled,
  type IconProps,
  IconSpeakerphone,
  IconUsers,
  IconVocabulary,
} from "@tabler/icons-react"
import type { ComponentProps, ForwardRefExoticComponent, RefAttributes } from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Badge, cn } from "@dotkomonline/ui"
import type { NotificationPayloadType, NotificationType } from "@dotkomonline/rpc"

export interface NotificationItemType {
  id: string
  createdAt: Date
  updatedAt: Date
  title: string
  shortDescription: string
  content: string
  type: NotificationType
  payload?: string
  payloadType: NotificationPayloadType
  actorGroupId: string
  createdById?: string
  lastUpdatedById?: string
  taskId?: string
  readAt?: Date
}

export const NotificationIconMap: Record<
  NotificationType,
  ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>
> = {
  BROADCAST: IconMessageCircleFilled,
  BROADCAST_IMPORTANT: IconSpeakerphone,
  EVENT_REGISTRATION: IconCalendarPlus,
  EVENT_REMINDER: IconCalendarTime,
  EVENT_UPDATE: IconCalendarExclamation,
  JOB_LISTING_REMINDER: IconBriefcaseFilled,
  NEW_ARTICLE: IconBookFilled,
  NEW_EVENT: IconCalendarUp,
  NEW_INTEREST_GROUP: IconUsers,
  NEW_JOB_LISTING: IconBriefcaseFilled,
  NEW_OFFLINE: IconVocabulary,
  NEW_MARK: IconSpeakerphone,
  NEW_FEEDBACK_FORM: IconSpeakerphone,
}

interface NotificationItem extends ComponentProps<typeof DropdownMenu.Item> {
  notification: NotificationItemType
  onItemClick?: () => void
}

export const NotificationItem = ({ notification, onItemClick, className, ...props }: NotificationItem) => {
  const Icon = NotificationIconMap[notification.type]
  const isRead = !!notification.readAt
  const isImportant = notification.type === "BROADCAST_IMPORTANT"

  const unreadItemColor = isImportant
    ? "border-l-red-500 bg-red-500/5 hover:bg-red-500/10 focus-visible:bg-red-500/10 dark:focus-visible:bg-red-500/15"
    : "border-l-blue-500 bg-blue-500/5 hover:bg-blue-500/10 focus-visible:bg-blue-500/10 dark:focus-visible:bg-blue-500/15"
  const unreadDotColor = isImportant ? "bg-red-500" : "bg-blue-500"
  const unreadTextColor = isImportant ? "text-red-600" : "text-blue-600"
  const unreadIconBgColor = isImportant ? "bg-red-500/20" : "bg-blue-500/20"

  return (
    <DropdownMenu.Item
      {...props}
      className={cn(
        "flex gap-4 px-5 py-4 cursor-pointer border-l-4 focus-visible:outline-none not-last:border-b not-last:border-b-white/10",
        { [unreadItemColor]: !isRead },
        {
          "opacity-80 border-transparent hover:bg-black/5 focus-visible:bg-black/10 dark:hover:bg-white/5 dark:focus-visible:bg-white/10":
            isRead,
        },
        className
      )}
      onClick={onItemClick}
    >
      <div className="flex flex-row gap-3 w-full">
        <div>
          <div
            className={cn(
              "rounded-lg flex items-center justify-center h-10 w-10",
              { [unreadIconBgColor]: !isRead },
              { "bg-black/20": isRead }
            )}
          >
            <Icon
              className={cn("w-6 h-6", { [unreadTextColor]: !isRead }, { "text-stone-800 dark:text-white": isRead })}
            />
          </div>
          {!isRead && <div className={cn("h-2 w-2 rounded-full mx-auto mt-2", unreadDotColor)} />}
        </div>
        <div className="flex flex-col p-0.5 w-full relative">
          <p className="text-black/70 dark:text-white/70 text-xs ml-auto absolute top-0 right-0">5 timer siden</p>

          {isImportant && (
            <Badge
              variant="solid"
              color="red"
              className={cn("bg-red-500 text-white text-xs py-1 px-2", { "mb-1": isImportant })}
            >
              Viktig melding
            </Badge>
          )}

          <p className="font-semibold text-black dark:text-white text-sm">{notification.title}</p>
          <p className="text-black dark:text-white/80 text-sm">{notification.shortDescription}</p>
        </div>
      </div>
    </DropdownMenu.Item>
  )
}
