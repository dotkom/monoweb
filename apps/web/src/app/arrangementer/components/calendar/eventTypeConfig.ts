interface EventCategoryConfig {
  displayName: string
  classes: {
    guide: string
    item: string
    itemBorder: string
    itemFade: string
    card: string
    badge: string
  }
}

export const eventCategories: Record<string, EventCategoryConfig> = {
  SOCIAL: {
    displayName: "Sosialt",
    classes: {
      guide: "bg-green-500 dark:bg-green-600",
      item: "bg-green-100 text-green-900 border-green-500 dark:bg-green-950 dark:text-green-300 dark:border-green-600",
      itemBorder: "border-green-500 dark:border-green-600",
      itemFade: "to-green-100 dark:to-green-950",
      card: "bg-green-100 text-green-950 border-green-200 hover:border-green-500 dark:bg-green-950 dark:text-green-50 dark:border-green-900 dark:hover:border-green-600",
      badge: "bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-200",
    },
  },
  COMPANY: {
    displayName: "Bedpres",
    classes: {
      guide: "bg-red-500 dark:bg-red-600",
      item: "bg-red-100 text-red-900 border-red-500 dark:bg-red-950 dark:text-red-300 dark:border-red-600",
      itemBorder: "border-red-500 dark:border-red-600",
      itemFade: "to-red-100 dark:to-red-950",
      card: "bg-red-100 text-red-950 border-red-200 hover:border-red-500 dark:bg-red-950 dark:text-red-50 dark:border-red-900 dark:hover:border-red-600",
      badge: "bg-red-200 text-red-700 dark:bg-red-800 dark:text-red-200",
    },
  },
  ACADEMIC: {
    displayName: "Kurs",
    classes: {
      guide: "bg-blue-500 dark:bg-blue-600",
      item: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300",
      itemBorder: "border-blue-500 dark:border-blue-600",
      itemFade: "to-blue-100 dark:to-blue-950",
      card: "bg-blue-100 text-blue-950 border-blue-200 hover:border-blue-500 dark:bg-blue-950 dark:text-blue-50 dark:border-blue-900 dark:hover:border-blue-600",
      badge: "bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-200",
    },
  },
  INTERNAL: {
    displayName: "Internt",
    classes: {
      guide: "bg-yellow-500 dark:bg-yellow-600",
      item: "bg-yellow-100 text-yellow-900 border-yellow-500 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-600",
      itemBorder: "border-yellow-500 dark:border-yellow-600",
      itemFade: "to-yellow-100 dark:to-yellow-950",
      card: "bg-yellow-100 text-yellow-950 border-yellow-200 hover:border-yellow-500 dark:bg-yellow-950 dark:text-yellow-50 dark:border-yellow-900 dark:hover:border-yellow-600",
      badge: "bg-yellow-200 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200",
    },
  },
  // Change these colors to match Fadderuka Theme
  WELCOME: {
    displayName: "Fadderuke",
    classes: {
      guide: "bg-yellow-500 dark:bg-yellow-600",
      item: "bg-yellow-100 text-yellow-900 border-yellow-500 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-600",
      itemBorder: "border-yellow-500 dark:border-yellow-600",
      itemFade: "to-yellow-100 dark:to-yellow-950",
      card: "bg-yellow-100 text-yellow-950 border-yellow-200 hover:border-yellow-500 dark:bg-yellow-950 dark:text-yellow-50 dark:border-yellow-900 dark:hover:border-yellow-600",
      badge: "bg-yellow-200 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200",
    },
  },
  GENERAL_ASSEMBLY: {
    displayName: "Genfors",
    classes: {
      guide: "bg-yellow-500 dark:bg-yellow-600",
      item: "bg-yellow-100 text-yellow-900 border-yellow-500 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-600",
      itemBorder: "border-yellow-500 dark:border-yellow-600",
      itemFade: "to-yellow-100 dark:to-yellow-950",
      card: "bg-yellow-100 text-yellow-950 border-yellow-200 hover:border-yellow-500 dark:bg-yellow-950 dark:text-yellow-50 dark:border-yellow-900 dark:hover:border-yellow-600",
      badge: "bg-yellow-200 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200",
    },
  },
  OTHER: {
    displayName: "Annet",
    classes: {
      guide: "bg-yellow-500 dark:bg-yellow-600",
      item: "bg-yellow-100 text-yellow-900 border-yellow-500 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-600",
      itemBorder: "border-yellow-500 dark:border-yellow-600",
      itemFade: "to-yellow-100 dark:to-yellow-950",
      card: "bg-yellow-100 text-yellow-950 border-yellow-200 hover:border-yellow-500 dark:bg-yellow-950 dark:text-yellow-50 dark:border-yellow-900 dark:hover:border-yellow-600",
      badge: "bg-yellow-200 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200",
    },
  },
}

export type EventCategoryKey = keyof typeof eventCategories
