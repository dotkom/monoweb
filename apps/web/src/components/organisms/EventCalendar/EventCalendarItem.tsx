"use client"

import type { Event } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@dotkomonline/ui"
import Link from "next/link"

interface EventCalendarItemProps {
  event: Event
  classNames?: string
}

type EventType = "SOCIAL" | "BEDPRES" | "ACADEMIC" | "COMPANY"

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
      itemBg: "bg-green-4",
      itemBgGradientFade: "to-green-4",
      itemBgHover: "hover:bg-green-5",
      itemBorder: "border-green-9",
      itemBorderLight: "border-green-5",
      itemText: "text-green-11",
      cardBg: "bg-green-2",
      cardText: "text-green-12",
      cardBorderHover: "hover:border-green-7",
      badgeBg: "bg-green-4",
      badgeText: "text-green-11",
    },
    displayName: "Sosialt",
  },
  BEDPRES: {
    colors: {
      itemBg: "bg-blue-4",
      itemBgGradientFade: "to-blue-4",
      itemBgHover: "hover:bg-blue-5",
      itemBorder: "border-blue-9",
      itemBorderLight: "border-blue-5",
      itemText: "text-blue-11",
      cardBg: "bg-blue-2",
      cardText: "text-blue-12",
      cardBorderHover: "hover:border-blue-7",
      badgeBg: "bg-blue-4",
      badgeText: "text-blue-11",
    },
    displayName: "Bedpres",
  },
  ACADEMIC: {
    colors: {
      itemBg: "bg-red-4",
      itemBgGradientFade: "to-red-4",
      itemBgHover: "hover:bg-red-5",
      itemBorder: "border-red-9",
      itemBorderLight: "border-red-5",
      itemText: "text-red-11",
      cardBg: "bg-red-2",
      cardText: "text-red-12",
      cardBorderHover: "hover:border-red-7",
      badgeBg: "bg-red-4",
      badgeText: "text-red-11",
    },
    displayName: "Kurs",
  },
  COMPANY: {
    colors: {
      itemBg: "bg-indigo-4",
      itemBgGradientFade: "to-indigo-4",
      itemBgHover: "hover:bg-indigo-5",
      itemBorder: "border-indigo-9",
      itemBorderLight: "border-indigo-5",
      itemText: "text-indigo-11",
      cardBg: "bg-indigo-2",
      cardText: "text-indigo-12",
      cardBorderHover: "hover:border-indigo-7",
      badgeBg: "bg-indigo-4",
      badgeText: "text-indigo-11",
    },
    displayName: "Bedriftsarragement",
  },
}

const DEFAULT_STYLES = {
  itemBg: "bg-slate-4",
  itemBgGradientFade: "to-slate-4",
  itemBgHover: "hover:bg-slate-5",
  itemBorder: "border-slate-6",
  itemText: "text-slate-11",
  cardBg: "bg-slate-2",
  cardText: "text-slate-11",
  cardBorder: "border-slate-5",
  cardBorderHover: "hover:border-slate-7",
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

const EventCalendarItem = ({ event, classNames }: EventCalendarItemProps) => {
  const isActive = new Date() < event.end
  const theme = getEventTheme(event, isActive)

  return (
    <HoverCard openDelay={50} closeDelay={50}>
      <HoverCardTrigger asChild>
        <Link
          href={`/events/${event.id}`}
          className={`
            ml-[2px] mr-[1px] my-0.5 pl-[0.2rem] sm:pl-[0.4rem]
            text-xs sm:text-sm sm:mx-1 cursor-pointer overflow-hidden
            relative
            ${theme.item.base}
            ${classNames || ""}
          `}
        >
          <div className="relative">
            <span className="block text-nowrap text-clip font-semibold sm:font-medium leading-8">{event.title}</span>
            <div
              className={`absolute inset-y-0 right-0 w-5 bg-gradient-to-r from-transparent ${theme.item.gradient} pointer-events-none`}
            />
          </div>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent
        className={`
          border-2 border-transparent transition-colors duration-300
          ${theme.card.bg} ${theme.card.borderHover}
        `}
        sideOffset={3}
      >
        <Link href={`/events/${event.id}`}>
          <div className={`p-4 ${theme.card.text}`}>
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
            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-2 items-center text-sm">
                <Icon icon="tabler:users" width={16} height={16} />
                <span>3/40</span>
              </div>
              {theme.badge && (
                <div>
                  <span
                    className={`
                    inline-block px-3 py-1 text-sm rounded-full font-semibold 
                    ${theme.badge.bg}
                    ${theme.badge.text}
                  `}
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

export default EventCalendarItem
