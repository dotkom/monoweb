import { navigations } from "@/lib/navigation"
import type { Article } from "@dotkomonline/rpc/article"
import type { Company } from "@dotkomonline/rpc/company"
import type { Contest } from "@dotkomonline/rpc/contest"
import type { EventWithAttendanceSummary } from "@dotkomonline/rpc/event"
import type { Fadderuke } from "@dotkomonline/rpc/fadderuke"
import type { Group } from "@dotkomonline/rpc/group"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import type { JobListing } from "@dotkomonline/rpc/job-listing"
import type { Mark } from "@dotkomonline/rpc/mark"
import type { Notification } from "@dotkomonline/rpc/notification"
import type { Offline } from "@dotkomonline/rpc/offline"
import type { User } from "@dotkomonline/rpc/user"
import { IconFileDescription } from "@tabler/icons-react"
import type { SearchItem } from "./command-palette-search"

const DEFAULT_ICON = IconFileDescription

function getIconForHref(href: string) {
  const page = navigations.find((item) => href === item.href || href.startsWith(`${item.href}/`))
  return page?.icon ?? DEFAULT_ICON
}

export function toEventSearchItem(eventWithAttendance: EventWithAttendanceSummary): SearchItem {
  const { event } = eventWithAttendance
  const href = `/arrangementer/${event.id}`

  return {
    id: `event:${event.id}`,
    kind: "resource",
    label: event.title,
    href,
    icon: getIconForHref(href),
    keywords: [],
    resourceId: event.id,
  }
}

export function toNotificationSearchItem(notification: Notification): SearchItem {
  const href = `/varslinger/${notification.id}`

  return {
    id: `notification:${notification.id}`,
    kind: "resource",
    label: notification.title,
    href,
    icon: getIconForHref(href),
    keywords: [],
    resourceId: notification.id,
  }
}

export function toMarkSearchItem(mark: Mark): SearchItem {
  const href = `/prikker/${mark.id}`

  return {
    id: `mark:${mark.id}`,
    kind: "resource",
    label: mark.title,
    href,
    icon: getIconForHref(href),
    keywords: [],
    resourceId: mark.id,
  }
}

export function toJobListingSearchItem(jobListing: JobListing): SearchItem {
  const href = `/karriere/${jobListing.id}`

  return {
    id: `job-listing:${jobListing.id}`,
    kind: "resource",
    label: jobListing.title,
    href,
    icon: getIconForHref(href),
    keywords: [],
    resourceId: jobListing.id,
  }
}

export function toCompanySearchItem(company: Company): SearchItem {
  const href = `/bedrifter/${company.slug}`

  return {
    id: `company:${company.id}`,
    kind: "resource",
    label: company.name,
    href,
    icon: getIconForHref(href),
    keywords: [],
    resourceId: company.id,
  }
}

export function toUserSearchItem(user: User): SearchItem {
  const href = `/brukere/${user.id}`

  return {
    id: `user:${user.id}`,
    kind: "resource",
    label: user.name ?? user.username,
    href,
    icon: getIconForHref(href),
    keywords: [user.email].filter((value): value is string => Boolean(value)),
    resourceId: user.id,
  }
}

export function toGroupSearchItem(group: Group): SearchItem {
  const href = `/grupper/${group.slug}`

  return {
    id: `group:${group.slug}`,
    kind: "resource",
    label: getGroupDisplayName(group),
    href,
    icon: getIconForHref(href),
    keywords: [group.name, group.abbreviation].filter((value): value is string => Boolean(value)),
    resourceId: group.slug,
  }
}

export function toContestSearchItem(contest: Contest): SearchItem {
  const href = `/konkurranser/${contest.id}`

  return {
    id: `contest:${contest.id}`,
    kind: "resource",
    label: contest.name,
    href,
    icon: getIconForHref(href),
    keywords: [],
    resourceId: contest.id,
  }
}

export function toArticleSearchItem(article: Article): SearchItem {
  const href = `/artikler/${article.slug}`

  return {
    id: `article:${article.id}`,
    kind: "resource",
    label: article.title,
    href,
    icon: getIconForHref(href),
    keywords: [],
    resourceId: article.id,
  }
}

export function toOfflineSearchItem(offline: Offline): SearchItem {
  const href = `/offline/${offline.id}`

  return {
    id: `offline:${offline.id}`,
    kind: "resource",
    label: offline.title,
    href,
    icon: getIconForHref(href),
    keywords: [],
    resourceId: offline.id,
  }
}

export function toFadderukeSearchItem(fadderuke: Fadderuke): SearchItem {
  const href = `/fadderukene/${fadderuke.id}`

  return {
    id: `fadderuke:${fadderuke.id}`,
    kind: "resource",
    label: `Fadderukene ${fadderuke.year}`,
    href,
    icon: getIconForHref(href),
    keywords: [],
    resourceId: fadderuke.id,
  }
}
