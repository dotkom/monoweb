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
      itemBg: "bg-green-300",
      itemBgGradientFade: "to-green-300",
      itemBgHover: "hover:bg-green-400",
      itemBorder: "border-green-800",
      itemBorderLight: "border-green-400",
      itemText: "text-green-950",
      cardBg: "bg-green-100",
      cardText: "text-black",
      cardBorderHover: "hover:border-green-600",
      badgeBg: "bg-green-300",
      badgeText: "text-green-950",
    },
    displayName: "Sosialt",
  },
  BEDPRES: {
    colors: {
      itemBg: "bg-blue-300",
      itemBgGradientFade: "to-blue-300",
      itemBgHover: "hover:bg-blue-400",
      itemBorder: "border-blue-800",
      itemBorderLight: "border-blue-400",
      itemText: "text-blue-950",
      cardBg: "bg-blue-100",
      cardText: "text-black",
      cardBorderHover: "hover:border-blue-600",
      badgeBg: "bg-blue-300",
      badgeText: "text-blue-950",
    },
    displayName: "Bedpres",
  },
  ACADEMIC: {
    colors: {
      itemBg: "bg-red-300",
      itemBgGradientFade: "to-red-300",
      itemBgHover: "hover:bg-red-400",
      itemBorder: "border-red-800",
      itemBorderLight: "border-red-400",
      itemText: "text-red-950",
      cardBg: "bg-red-100",
      cardText: "text-black",
      cardBorderHover: "hover:border-red-600",
      badgeBg: "bg-red-300",
      badgeText: "text-red-950",
    },
    displayName: "Kurs",
  },
  COMPANY: {
    colors: {
      itemBg: "bg-indigo-300",
      itemBgGradientFade: "to-indigo-300",
      itemBgHover: "hover:bg-indigo-400",
      itemBorder: "border-indigo-800",
      itemBorderLight: "border-indigo-400",
      itemText: "text-indigo-950",
      cardBg: "bg-indigo-100",
      cardText: "text-black",
      cardBorderHover: "hover:border-indigo-600",
      badgeBg: "bg-indigo-300",
      badgeText: "text-indigo-950",
    },
    displayName: "Bedriftsarragement",
  },
}

const DEFAULT_STYLES = {
  itemBg: "bg-gray-300",
  itemBgGradientFade: "to-gray-300",
  itemBgHover: "hover:bg-gray-400",
  itemBorder: "border-gray-500",
  itemText: "text-gray-950",
  cardBg: "bg-gray-100",
  cardText: "text-gray-950",
  cardBorder: "border-gray-400",
  cardBorderHover: "hover:border-gray-600",
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
            <p className="text-l font-semibold mb-2">{event.title}</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Icon icon="tabler:clock" width={16} height={16} />
                <span className="text-sm">
                  {String(event.start.getHours()).padStart(2, "0")}:{String(event.start.getMinutes()).padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center gap-1 overflow-hidden">
                <Icon icon="tabler:map-pin" width={16} height={16} />
                <span className="text-sm truncate">{event.locationTitle}</span>
              </div>
            </div>
            <div className="flex justify-between items-center gap-2 mt-2">
              <div className="flex gap-2 items-center text-sm">
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
