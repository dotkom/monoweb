import { AttendanceStatus } from "@/components/molecules/EventListItem/AttendanceStatus"
import type { EventWithAttendance } from "@dotkomonline/types"
import { Icon, Text, Title } from "@dotkomonline/ui"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@dotkomonline/ui"
import { cn } from "@dotkomonline/ui"
import { slugify } from "@dotkomonline/utils"
import Link from "next/link"
import { eventCategories } from "./eventTypeConfig"
import type { EventDisplayProps } from "./types"

// helper functions so tailwind picks up the class names correctly
function getColStartClass(startCol: number) {
  switch (startCol) {
    case 3:
      return "col-start-3"
    case 4:
      return "col-start-4"
    case 5:
      return "col-start-5"
    case 6:
      return "col-start-6"
    case 7:
      return "col-start-7"
    case 8:
      return "col-start-8"
    default:
      return ""
  }
}

function getColSpanClass(span: number) {
  switch (span) {
    case 1:
      return "col-span-1"
    case 2:
      return "col-span-2"
    case 3:
      return "col-span-3"
    case 4:
      return "col-span-4"
    case 5:
      return "col-span-5"
    case 6:
      return "col-span-6"
    case 7:
      return "col-span-7"
    default:
      return ""
  }
}

interface EventCalendarItemProps {
  eventDetail: EventWithAttendance
  reservedStatus: boolean | null
  className?: string
  eventDisplayProps: EventDisplayProps
}

export const EventCalendarItem = ({ eventDetail, reservedStatus, eventDisplayProps }: EventCalendarItemProps) => {
  const { event, attendance } = eventDetail
  const isActive = new Date() < event.end

  const category = event.type ? eventCategories[event.type] : undefined
  const triggerClasses = category?.classes.item ?? "bg-gray-100 dark:bg-stone-800"
  const borderClasses = category?.classes.itemBorder ?? "border-gray-500 dark:border-stone-500"
  const cardClasses = category?.classes.card ?? "bg-gray-100 border-gray-300 dark:bg-stone-800 dark:border-stone-600"
  const badgeClasses = category?.classes.badge ?? ""
  const categoryName = category?.displayName ?? ""
  const fadeClasses = category?.classes.itemFade ?? ""

  return (
    <HoverCard>
      <Link href={`/arrangementer/${slugify(event.title)}/${event.id}`}>
        <HoverCardTrigger
          className={cn(
            "ml-[2px] mr-[1px] my-0.5 pl-[0.2rem] sm:pl-[0.4rem] text-xs sm:text-sm sm:mx-1 overflow-hidden relative",
            isActive ? triggerClasses : "bg-gray-100 text-gray-500 dark:bg-stone-800 dark:text-stone-400",
            borderClasses,
            getColStartClass(eventDisplayProps.startCol + 2),
            getColSpanClass(eventDisplayProps.span),
            eventDisplayProps.leftEdge && "sm:border-l-4 rounded-l-md",
            eventDisplayProps.rightEdge && "rounded-r-md"
          )}
        >
          <div className="relative">
            <span className="block text-nowrap text-clip font-semibold sm:font-medium leading-8">{event.title}</span>
            <div
              className={cn(
                "absolute inset-y-0 right-0 w-5 bg-gradient-to-r from-transparent pointer-events-none",
                isActive ? fadeClasses : "to-gray-100 dark:to-stone-800"
              )}
            />
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          className={cn(
            "border-2 border-transparent transition-colors duration-300 max-w-80 min-w-60 w-full",
            cardClasses
          )}
        >
          <div className="p-4">
            <Title element="p" size="md" className="mb-2">
              {event.title}
            </Title>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Icon icon="tabler:clock" width={16} height={16} />
                <Text element="span" className="text-sm">
                  {String(event.start.getHours()).padStart(2, "0")}:{String(event.start.getMinutes()).padStart(2, "0")}
                </Text>
              </div>
              {event.locationTitle && (
                <div className="flex items-center gap-1 overflow-hidden">
                  <Icon icon="tabler:map-pin" width={16} height={16} />
                  <Text element="span" className="text-sm truncate">
                    {event.locationTitle}
                  </Text>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center gap-2 mt-2">
              {attendance && (
                <AttendanceStatus
                  attendance={attendance}
                  reservedStatus={reservedStatus}
                  eventEndInPast={new Date() > event.end}
                />
              )}
              {categoryName && (
                <div className="ml-auto">
                  <Text
                    element="span"
                    className={cn("inline-block px-2 py-1 text-sm rounded-md font-semibold", badgeClasses)}
                  >
                    {categoryName}
                  </Text>
                </div>
              )}
            </div>
          </div>
        </HoverCardContent>
      </Link>
    </HoverCard>
  )
}
