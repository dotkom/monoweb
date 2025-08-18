"use client"

import { AttendanceStatus } from "@/components/molecules/EventListItem/AttendanceStatus"
import type { Event, EventType, EventWithAttendance } from "@dotkomonline/types"
import { Icon, Text, Title } from "@dotkomonline/ui"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@dotkomonline/ui"
import { cn } from "@dotkomonline/ui"
import { slugify } from "@dotkomonline/utils"
import Link from "next/link"

interface EventCalendarItemProps {
  eventDetail: EventWithAttendance
  reservedStatus: boolean | null
  className?: string
}

interface EventTypeConfig {
  colors: {
    itemBg: string
    itemBgGradientFade: string
    itemBorder: string
    itemBorderLight: string
    itemText: string
    cardBg: string
    cardText: string
    cardBorderHover: string
    badgeBg: string
    badgeText: string
  }
  displayName: string
}

const EVENT_TYPE_CONFIG: Record<EventType, EventTypeConfig> = {
  SOCIAL: {
    colors: {
      itemBg: "bg-green-100 dark:bg-green-950",
      itemBgGradientFade: "to-green-100 dark:to-green-950",
      itemBorder: "border-green-400 dark:border-green-600",
      itemBorderLight: "border-green-200 dark:border-green-800",
      itemText: "text-green-900 dark:text-green-300",
      cardBg: "bg-green-100 dark:bg-green-950 border-green-200 dark:border-green-900",
      cardText: "text-green-950 dark:text-green-50",
      cardBorderHover: "hover:border-green-400 dark:hover:border-green-600",
      badgeBg: "bg-green-200 dark:bg-green-900",
      badgeText: "text-green-800 dark:text-green-300",
    },
    displayName: "Sosialt",
  },
  GENERAL_ASSEMBLY: {
    colors: {
      itemBg: "bg-yellow-100 dark:bg-yellow-950",
      itemBgGradientFade: "to-yellow-100 dark:to-yellow-950",
      itemBorder: "border-yellow-400 dark:border-yellow-600",
      itemBorderLight: "border-yellow-200 dark:border-yellow-800",
      itemText: "text-yellow-900 dark:text-yellow-300",
      cardBg: "bg-yellow-100 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900",
      cardText: "text-yellow-950 dark:text-yellow-50",
      cardBorderHover: "hover:border-yellow-400 dark:hover:border-yellow-600",
      badgeBg: "bg-yellow-200 dark:bg-yellow-900",
      badgeText: "text-yellow-800 dark:text-yellow-300",
    },
    displayName: "Genfors",
  },
  INTERNAL: {
    colors: {
      itemBg: "bg-yellow-100 dark:bg-yellow-950",
      itemBgGradientFade: "to-yellow-100 dark:to-yellow-950",
      itemBorder: "border-yellow-400 dark:border-yellow-600",
      itemBorderLight: "border-yellow-200 dark:border-yellow-800",
      itemText: "text-yellow-900 dark:text-yellow-300",
      cardBg: "bg-yellow-100 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900",
      cardText: "text-yellow-950 dark:text-yellow-50",
      cardBorderHover: "hover:border-yellow-400 dark:hover:border-yellow-600",
      badgeBg: "bg-yellow-200 dark:bg-yellow-900",
      badgeText: "text-yellow-800 dark:text-yellow-300",
    },
    displayName: "Intern",
  },
  WELCOME: {
    colors: {
      itemBg: "bg-yellow-100 dark:bg-yellow-950",
      itemBgGradientFade: "to-yellow-100 dark:to-yellow-950",
      itemBorder: "border-orange-400 dark:border-orange-600",
      itemBorderLight: "border-yellow-200 dark:border-yellow-800",
      itemText: "text-orange-900 dark:text-orange-300",
      cardBg: "bg-yellow-100 dark:bg-yellow-950 border-orange-200 dark:border-orange-900",
      cardText: "text-orange-950 dark:text-orange-50",
      cardBorderHover: "hover:border-orange-400 dark:hover:border-orange-600",
      badgeBg: "bg-orange-200 dark:bg-orange-900",
      badgeText: "text-orange-800 dark:text-orange-300",
    },
    displayName: "Fadderuke",
  },
  OTHER: {
    colors: {
      itemBg: "bg-yellow-100 dark:bg-yellow-950",
      itemBgGradientFade: "to-yellow-100 dark:to-yellow-950",
      itemBorder: "border-yellow-400 dark:border-yellow-600",
      itemBorderLight: "border-yellow-200 dark:border-yellow-800",
      itemText: "text-yellow-900 dark:text-yellow-300",
      cardBg: "bg-yellow-100 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900",
      cardText: "text-yellow-950 dark:text-yellow-50",
      cardBorderHover: "hover:border-yellow-400 dark:hover:border-yellow-600",
      badgeBg: "bg-yellow-200 dark:bg-yellow-900",
      badgeText: "text-yellow-800 dark:text-yellow-300",
    },
    displayName: "Annet",
  },
  COMPANY: {
    colors: {
      itemBg: "bg-red-100 dark:bg-red-950",
      itemBgGradientFade: "to-red-100 dark:to-red-950",
      itemBorder: "border-red-400 dark:border-red-600",
      itemBorderLight: "border-red-200 dark:border-red-800",
      itemText: "text-red-900 dark:text-red-300",
      cardBg: "bg-red-100 dark:bg-red-950 border-red-200 dark:border-red-900",
      cardText: "text-red-950 dark:text-red-50",
      cardBorderHover: "hover:border-red-400 dark:hover:border-red-600",
      badgeBg: "bg-red-200 dark:bg-red-900",
      badgeText: "text-red-800 dark:text-red-300",
    },
    displayName: "Bedriftsarrangement",
  },
  ACADEMIC: {
    colors: {
      itemBg: "bg-blue-100 dark:bg-blue-950",
      itemBgGradientFade: "to-blue-100 dark:to-blue-950",
      itemBorder: "border-blue-400 dark:border-blue-600",
      itemBorderLight: "border-blue-200 dark:border-blue-800",
      itemText: "text-blue-900 dark:text-blue-300",
      cardBg: "bg-blue-100 dark:bg-blue-950 border-blue-200 dark:border-blue-900",
      cardText: "text-blue-950 dark:text-blue-50",
      cardBorderHover: "hover:border-blue-400 dark:hover:border-blue-600",
      badgeBg: "bg-blue-200 dark:bg-blue-900",
      badgeText: "text-blue-800 dark:text-blue-300",
    },
    displayName: "Kurs",
  },
}

const DEFAULT_STYLES = {
  itemBg: "bg-gray-100 dark:bg-stone-900",
  itemBgGradientFade: "to-gray-100 dark:to-stone-900",
  itemText: "text-gray-500 dark:text-stone-400",
  cardBg: "bg-gray-100 dark:bg-stone-800 border-gray-200 dark:border-stone-700",
  cardText: "text-gray-900 dark:text-gray-100",
  cardBorderHover: "hover:border-gray-400 dark:hover:border-stone-600",
}

interface EventTheme {
  item: {
    base: string
    gradient: string
  }
  card: {
    bg: string
    text: string
    borderHover: string
  }
  badge?: {
    bg: string
    text: string
    displayName: string
  }
}

function getEventTheme(event: Event, isActive: boolean): EventTheme {
  // Use OTHER config as fallback if event type is not found
  const config = EVENT_TYPE_CONFIG[event.type as EventType] || EVENT_TYPE_CONFIG.OTHER

  if (isActive) {
    return {
      item: {
        base: `${config.colors.itemBg} ${config.colors.itemBorder} ${config.colors.itemText}`,
        gradient: config.colors.itemBgGradientFade,
      },
      card: {
        bg: config.colors.cardBg,
        text: config.colors.cardText,
        borderHover: config.colors.cardBorderHover,
      },
      badge: {
        bg: config.colors.badgeBg,
        text: config.colors.badgeText,
        displayName: config.displayName,
      },
    }
  }

  // For inactive events, use DEFAULT_STYLES for item styling but keep the config colors for card and badge
  return {
    item: {
      base: `${DEFAULT_STYLES.itemBg} ${config.colors.itemBorderLight} ${DEFAULT_STYLES.itemText}`,
      gradient: DEFAULT_STYLES.itemBgGradientFade,
    },
    card: {
      bg: config.colors.cardBg,
      text: config.colors.cardText,
      borderHover: config.colors.cardBorderHover,
    },
    badge: {
      bg: config.colors.badgeBg,
      text: config.colors.badgeText,
      displayName: config.displayName,
    },
  }
}

export const EventCalendarItem = ({ eventDetail, reservedStatus, className }: EventCalendarItemProps) => {
  const { event, attendance } = eventDetail
  const isActive = new Date() < event.end
  const theme = getEventTheme(event, isActive)

  return (
    <HoverCard openDelay={50} closeDelay={50}>
      <HoverCardTrigger asChild>
        <Link
          href={`/arrangementer/${slugify(event.title)}/${event.id}`}
          className={cn(
            "ml-[2px] mr-[1px] my-0.5 pl-[0.2rem] sm:pl-[0.4rem] text-xs sm:text-sm sm:mx-1 cursor-pointer overflow-hidden relative",
            theme.item.base,
            className || ""
          )}
        >
          <div className="relative">
            <span className="block text-nowrap text-clip font-semibold sm:font-medium leading-8">{event.title}</span>
            <div
              className={cn(
                "absolute inset-y-0 right-0 w-5 bg-gradient-to-r from-transparent pointer-events-none",
                theme.item.gradient
              )}
            />
          </div>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent
        className={cn(
          "border-2 border-transparent transition-colors duration-300 max-w-80 min-w-60 w-full",
          theme.card.bg,
          theme.card.borderHover
        )}
        sideOffset={3}
      >
        <Link href={`/arrangementer/${slugify(event.title)}/${event.id}`}>
          <div className={cn("p-4", theme.card.text)}>
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
              {theme.badge && (
                <div>
                  <Text
                    element="span"
                    className={cn(
                      "inline-block px-2 py-1 text-sm rounded-md font-semibold",
                      theme.badge.bg,
                      theme.badge.text
                    )}
                  >
                    {theme.badge.displayName}
                  </Text>
                </div>
              )}
            </div>
          </div>
        </Link>
      </HoverCardContent>
    </HoverCard>
  )
}
