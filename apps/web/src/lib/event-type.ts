import type { EventType } from "@dotkomonline/rpc/event"
import type { BadgeColor } from "@dotkomonline/ui"

// Tailwind only picks up literal class names, so every class string is written out in full per color
interface EventTypeClasses {
  /** Solid dot, used in calendar legends and day markers */
  guide: string
  /** Event bar in the month/week calendar */
  item: string
  itemBorder: string
  itemFade: string
  /** Hover card in the month/week calendar */
  card: string
  badge: string
  /** Month header strip in CalendarBox */
  header: string
  headerText: string
  /** SVG fill for PlaceHolderImage */
  placeholder: string
}

interface EventTypeStyle {
  /** Short label for badges and compact UI. Use `mapEventTypeToLabel` for the full name */
  shortLabel: string
  badgeColor: BadgeColor
  classes: EventTypeClasses
}

const GREEN = {
  badgeColor: "green",
  classes: {
    guide: "bg-green-500 dark:bg-green-600",
    item: "bg-green-100 text-green-900 border-green-500 dark:bg-green-950 dark:text-green-300 dark:border-green-600",
    itemBorder: "border-green-500 dark:border-green-600",
    itemFade: "to-green-100 dark:to-green-950",
    card: "bg-green-100 text-green-950 border-green-200 hover:border-green-500 dark:bg-green-950 dark:text-green-50 dark:border-green-900 dark:hover:border-green-600",
    badge: "bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-200",
    header: "bg-green-100 dark:bg-green-950",
    headerText: "text-green-700 dark:text-green-200",
    placeholder: "fill-[#A7D9B6] dark:fill-[#1f3d2a]",
  },
} as const satisfies Omit<EventTypeStyle, "shortLabel">

const RED = {
  badgeColor: "red",
  classes: {
    guide: "bg-red-500 dark:bg-red-600",
    item: "bg-red-100 text-red-900 border-red-500 dark:bg-red-950 dark:text-red-300 dark:border-red-600",
    itemBorder: "border-red-500 dark:border-red-600",
    itemFade: "to-red-100 dark:to-red-950",
    card: "bg-red-100 text-red-950 border-red-200 hover:border-red-500 dark:bg-red-950 dark:text-red-50 dark:border-red-900 dark:hover:border-red-600",
    badge: "bg-red-200 text-red-700 dark:bg-red-800 dark:text-red-200",
    header: "bg-red-100 dark:bg-red-950",
    headerText: "text-red-700 dark:text-red-200",
    placeholder: "fill-[#E6B5B5] dark:fill-[#4f2626]",
  },
} as const satisfies Omit<EventTypeStyle, "shortLabel">

const BLUE = {
  badgeColor: "blue",
  classes: {
    guide: "bg-blue-500 dark:bg-blue-600",
    item: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300",
    itemBorder: "border-blue-500 dark:border-blue-600",
    itemFade: "to-blue-100 dark:to-blue-950",
    card: "bg-blue-100 text-blue-950 border-blue-200 hover:border-blue-500 dark:bg-blue-950 dark:text-blue-50 dark:border-blue-900 dark:hover:border-blue-600",
    badge: "bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-200",
    header: "bg-blue-100 dark:bg-blue-950",
    headerText: "text-blue-700 dark:text-blue-200",
    placeholder: "fill-[#AFC5E3] dark:fill-[#2a3553]",
  },
} as const satisfies Omit<EventTypeStyle, "shortLabel">

const AMBER = {
  badgeColor: "amber",
  classes: {
    guide: "bg-amber-500 dark:bg-amber-600",
    item: "bg-amber-100 text-amber-900 border-amber-500 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-600",
    itemBorder: "border-amber-500 dark:border-amber-600",
    itemFade: "to-amber-100 dark:to-amber-950",
    card: "bg-amber-100 text-amber-950 border-amber-200 hover:border-amber-500 dark:bg-amber-950 dark:text-amber-50 dark:border-amber-900 dark:hover:border-amber-600",
    badge: "bg-amber-200 text-amber-700 dark:bg-amber-800 dark:text-amber-200",
    header: "bg-amber-500/15 dark:bg-amber-500/20",
    headerText: "text-amber-800 dark:text-amber-200",
    placeholder: "fill-[#EBD4A0] dark:fill-[#4a3522]",
  },
} as const satisfies Omit<EventTypeStyle, "shortLabel">

export const EVENT_TYPE_STYLES = {
  SOCIAL: { shortLabel: "Sosialt", ...GREEN },
  COMPANY: { shortLabel: "Bedpres", ...RED },
  ACADEMIC: { shortLabel: "Kurs", ...BLUE },
  // Change these colors to match Fadderuka Theme
  WELCOME: { shortLabel: "Fadderuke", ...AMBER },
  GENERAL_ASSEMBLY: { shortLabel: "Genfors", ...AMBER },
  OTHER: { shortLabel: "Annet", ...AMBER },
} as const satisfies Record<EventType, EventTypeStyle>
