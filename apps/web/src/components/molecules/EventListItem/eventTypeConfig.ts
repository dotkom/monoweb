import type { EventType } from "@dotkomonline/rpc/event"
import type { BadgeColor } from "@dotkomonline/ui"

export const EVENT_TYPE_CONFIG = {
  ACADEMIC: {
    label: "Kurs",
    backgroundColor: "blue",
  },
  GENERAL_ASSEMBLY: {
    label: "Genfors",
    backgroundColor: "amber",
  },
  INTERNAL: {
    label: "Intern",
    backgroundColor: "amber",
  },
  OTHER: {
    label: "Annet",
    backgroundColor: "amber",
  },
  COMPANY: {
    label: "Bedpres",
    backgroundColor: "red",
  },
  SOCIAL: {
    label: "Sosialt",
    backgroundColor: "green",
  },
  WELCOME: {
    label: "Fadderuke",
    backgroundColor: "amber",
  },
} as const satisfies Record<EventType, { label: string; backgroundColor: BadgeColor }>
