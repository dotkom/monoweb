"use client"

import type { Event, EventType } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@dotkomonline/ui"
import { cn } from "@dotkomonline/ui"
import { slugify } from "@dotkomonline/utils"
import Link from "next/link"

interface EventCalendarItemProps {
  event: Event
  className?: string
}

interface EventTypeConfig {
  colors: {
    itemBg: string
    itemBgGradientFade: string
    itemBgHover: string
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
      itemBgHover: "hover:bg-green-200 dark:hover:bg-green-900",
      itemBorder: "border-green-400 dark:border-green-600",
      itemBorderLight: "border-green-200 dark:border-green-800",
      itemText: "text-green-900 dark:text-green-300",
      cardBg: "bg-green-100 dark:bg-green-950",
      cardText: "text-green-950 dark:text-green-50",
      cardBorderHover: "hover:border-green-400 dark:hover:border-green-800",
      badgeBg: "bg-green-200 dark:bg-green-900",
      badgeText: "text-green-800 dark:text-green-300",
    },
    displayName: "Sosialt",
  },
  BEDPRES: {
    colors: {
      itemBg: "bg-blue-100 dark:bg-blue-950",
      itemBgGradientFade: "to-blue-100 dark:to-blue-950",
      itemBgHover: "hover:bg-blue-200 dark:hover:bg-blue-900",
      itemBorder: "border-blue-400 dark:border-blue-600",
      itemBorderLight: "border-blue-200 dark:border-blue-800",
      itemText: "text-blue-900 dark:text-blue-300",
      cardBg: "bg-blue-100 dark:bg-blue-950",
      cardText: "text-blue-950 dark:text-blue-50",
      cardBorderHover: "hover:border-blue-400 dark:hover:border-blue-800",
      badgeBg: "bg-blue-200 dark:bg-blue-900",
      badgeText: "text-blue-800 dark:text-blue-300",
    },
    displayName: "Bedpres",
  },
  ACADEMIC: {
    colors: {
      itemBg: "bg-red-100 dark:bg-red-950",
      itemBgGradientFade: "to-red-100 dark:to-red-950",
      itemBgHover: "hover:bg-red-200 dark:hover:bg-red-900",
      itemBorder: "border-red-400 dark:border-red-600",
      itemBorderLight: "border-red-200 dark:border-red-800",
      itemText: "text-red-900 dark:text-red-300",
      cardBg: "bg-red-100 dark:bg-red-950",
      cardText: "text-red-950 dark:text-red-50",
      cardBorderHover: "hover:border-red-400 dark:hover:border-red-800",
      badgeBg: "bg-red-200 dark:bg-red-900",
      badgeText: "text-red-800 dark:text-red-300",
    },
    displayName: "Kurs",
  },
  COMPANY: {
    colors: {
      itemBg: "bg-indigo-100 dark:bg-indigo-950",
      itemBgGradientFade: "to-indigo-100 dark:to-indigo-950",
      itemBgHover: "hover:bg-indigo-200 dark:hover:bg-indigo-900",
      itemBorder: "border-indigo-400 dark:border-indigo-600",
      itemBorderLight: "border-indigo-200 dark:border-indigo-800",
      itemText: "text-indigo-900 dark:text-indigo-300",
      cardBg: "bg-indigo-100 dark:bg-indigo-950",
      cardText: "text-indigo-950 dark:text-indigo-50",
      cardBorderHover: "hover:border-indigo-400 dark:hover:border-indigo-800",
      badgeBg: "bg-indigo-200 dark:bg-indigo-900",
      badgeText: "text-indigo-800 dark:text-indigo-300",
    },
    displayName: "Bedriftsarrangement",
  },
}

const DEFAULT_STYLES = {
  itemBg: "bg-gray-100 dark:bg-stone-900",
  itemBgGradientFade: "to-gray-100 dark:to-stone-900",
  itemBgHover: "hover:bg-gray-200 dark:hover:bg-stone-800",
  itemBorder: "border-gray-400 dark:border-gray-600",
  itemText: "text-gray-500 dark:text-gray-300",
  cardBg: "bg-gray-100 dark:bg-stone-800",
  cardText: "text-gray-900 dark:text-gray-100",
  cardBorderHover: "hover:border-gray-400 dark:hover:border-gray-800",
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
  const config = EVENT_TYPE_CONFIG[event.type as EventType]

  if (!config) {
    return {
      item: {
        base: `${DEFAULT_STYLES.itemBg} ${DEFAULT_STYLES.itemBorder} ${DEFAULT_STYLES.itemText}`,
        gradient: DEFAULT_STYLES.itemBgGradientFade,
      },
      card: {
        bg: DEFAULT_STYLES.cardBg,
        text: DEFAULT_STYLES.cardText,
        borderHover: DEFAULT_STYLES.cardBorderHover,
      },
    }
  }

  if (isActive) {
    return {
      item: {
        base: `${config.colors.itemBg} ${config.colors.itemBgHover} ${config.colors.itemBorder} ${config.colors.itemText}`,
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

  return {
    item: {
      base: `${DEFAULT_STYLES.itemBg} ${DEFAULT_STYLES.itemBgHover} ${config.colors.itemBorderLight} ${DEFAULT_STYLES.itemText}`,
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

export const EventCalendarItem = ({ event, className }: EventCalendarItemProps) => {
  const isActive = new Date() < event.end
  const theme = getEventTheme(event, isActive)

  return (
    <HoverCard openDelay={50} closeDelay={50}>
      <HoverCardTrigger asChild>
        <Link
          href={`/arrangementer/${slugify(event.title)}/${event.id}`}
          className={cn(
            "ml-[2px] mr-[1px] my-0.5 pl-[0.2rem] sm:pl-[0.4rem] text-xs sm:text-sm sm:mx-1 cursor-pointer overflow-hidden relative transition-colors duration-300",
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
            <p className="text-l font-semibold mb-2">{event.title}</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Icon icon="tabler:clock" width={16} height={16} />
                <span className="text-sm">
                  {String(event.start.getHours()).padStart(2, "0")}:{String(event.start.getMinutes()).padStart(2, "0")}
                </span>
              </div>
              {event.locationTitle && (
                <div className="flex items-center gap-1 overflow-hidden">
                  <Icon icon="tabler:map-pin" width={16} height={16} />
                  <span className="text-sm truncate">{event.locationTitle}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center gap-2 mt-2">
              <div className="flex gap-1 items-center text-sm">
                <Icon icon="tabler:users" width={16} height={16} />
                <span>3/40</span>
              </div>
              {theme.badge && (
                <div>
                  <span
                    className={cn(
                      "inline-block px-3 py-1 text-sm rounded-full font-semibold",
                      theme.badge.bg,
                      theme.badge.text
                    )}
                  >
                    {theme.badge.displayName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Link>
      </HoverCardContent>
    </HoverCard>
  )
}
