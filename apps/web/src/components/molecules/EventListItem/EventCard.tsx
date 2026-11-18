import { getAttendee, type AttendanceView, type AttendanceSummary } from "@dotkomonline/rpc/attendance"
import type { Event, EventSummary } from "@dotkomonline/rpc/event"
import type { UserId } from "@dotkomonline/rpc/user"
import { Text, Title, cn } from "@dotkomonline/ui"
import { createEventPageUrl } from "@dotkomonline/utils"
import { IconMapPin } from "@tabler/icons-react"
import { formatDate, isPast } from "date-fns"
import { nb } from "date-fns/locale"
import type { FC, ReactNode } from "react"
import { AttendanceStatus } from "./AttendanceStatus"
import { EventImage } from "./EventImage"
import { EventPrice } from "./EventPrice"
import { EventPreviewLink } from "./EventPreviewLink"

export interface EventCardProps {
  event: Event | EventSummary
  attendance: AttendanceView | AttendanceSummary | null
  userId?: UserId | null
  className?: string
  variant?: "default" | "personal" | "featured"
  header?: ReactNode
}

export const EventCard: FC<EventCardProps> = ({
  event,
  attendance,
  userId,
  className,
  variant = "default",
  header,
}) => {
  const { id, title, type, imageUrl, locationTitle } = event
  const attendee = getAttendee(attendance, userId ?? null)
  const eventHasEnded = isPast(event.end)
  const isDefault = variant === "default"
  const isPersonal = variant === "personal"
  const isFeatured = variant === "featured"

  return (
    <EventPreviewLink
      event={event}
      href={createEventPageUrl(id, title)}
      prefetch={isDefault ? false : undefined}
      className={cn(
        "group flex flex-col w-full min-w-0 rounded-2xl transition-colors",
        isDefault &&
          "h-fit gap-3 p-3 border border-transparent hover:border-gray-200 dark:hover:border-stone-700 dark:hover:bg-stone-800/20",
        isDefault && eventHasEnded && "text-gray-600 dark:text-stone-200",
        !isDefault && "h-full p-2",
        isPersonal && "gap-3",
        isFeatured && "gap-2 bg-white hover:bg-gray-50 dark:bg-stone-800/50 dark:hover:bg-stone-800",
        className
      )}
    >
      {header}
      <EventImage
        imageUrl={imageUrl}
        alt={title}
        start={event.start}
        end={event.end}
        eventType={type}
        className="w-full min-w-0"
        imageClassName="aspect-video w-full"
        showBadge={isDefault}
        showCalendarBox={isDefault}
      />

      <div
        className={cn(
          "flex flex-col w-full min-w-0",
          !isFeatured && "gap-2",
          !isDefault && "px-1 pb-1",
          isPersonal && "-mt-1"
        )}
      >
        <Title
          element="h3"
          size="lg"
          title={title}
          className={cn(
            "text-xl font-medium line-clamp-2 wrap-break-word transition-colors",
            isDefault && "max-md:text-lg",
            isDefault &&
              eventHasEnded &&
              "text-gray-600 dark:text-stone-400 group-hover:text-gray-800 dark:group-hover:text-stone-300"
          )}
        >
          {title}
        </Title>

        {isFeatured ? (
          <Text className="text-sm text-gray-600 dark:text-stone-400">
            {formatDate(event.start, "EEEE d. MMMM", { locale: nb })}
          </Text>
        ) : (
          <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-2 w-full min-w-0">
            {locationTitle && (
              <div className="flex flex-row items-center gap-2 min-w-0">
                <IconMapPin className="size-4 shrink-0 dark:text-stone-400" />
                <Text
                  className={cn(
                    "text-sm dark:text-stone-400",
                    isPersonal ? "line-clamp-1" : "wrap-break-word line-clamp-2 transition-colors",
                    isDefault &&
                      eventHasEnded &&
                      "text-gray-600 group-hover:text-gray-800 dark:group-hover:text-stone-300"
                  )}
                >
                  {locationTitle}
                </Text>
              </div>
            )}

            {attendance && (
              <>
                <AttendanceStatus
                  attendance={attendance}
                  attendee={attendee}
                  eventEndInPast={eventHasEnded}
                  size={isDefault ? "md" : undefined}
                  hideLock={isPersonal}
                  classNames={isPersonal ? { root: "order-first" } : undefined}
                />

                {isDefault && attendee?.registeredAt == null && <EventPrice price={attendance.attendancePrice} />}
              </>
            )}
          </div>
        )}
      </div>
    </EventPreviewLink>
  )
}

export const EventCardSkeleton: FC = () => {
  return (
    <div className="flex flex-col gap-3 border border-transparent p-3 rounded-2xl min-w-0 animate-pulse">
      <div className="aspect-video w-full bg-gray-300 dark:bg-stone-600 rounded-lg" />
      <div className="h-6 max-w-[85%] bg-gray-300 dark:bg-stone-600 rounded-sm" />
      <div className="h-4 max-w-[60%] bg-gray-300 dark:bg-stone-600 rounded-sm" />
    </div>
  )
}
