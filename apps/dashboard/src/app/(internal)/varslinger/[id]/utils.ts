import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import type { NotificationLink, NotificationManagement } from "@dotkomonline/rpc/notification"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"

export function getActorGroupLabel(actorGroup: NotificationManagement["actorGroup"]): string {
  if (actorGroup === null) {
    return "System"
  }

  return getGroupDisplayName(actorGroup)
}

export function getCreatedByName(
  createdById: string | null,
  userName: string | null | undefined,
  isUserNameLoading: boolean
): string {
  if (createdById === null) {
    return "System"
  }

  if (isUserNameLoading) {
    return "..."
  }

  if (userName === undefined || userName === null || userName.length === 0) {
    return "Ukjent"
  }

  return userName
}

export function formatSentAt(date: Date): string {
  return formatDate(date, "d. MMMM yyyy 'kl.' HH:mm", { locale: nb })
}

export function formatPercent(count: number, total: number): string {
  if (total === 0) {
    return "0 %"
  }

  return `${((count / total) * 100).toFixed(0)} %`
}

export function getNotificationLinkHref(link: NotificationLink): string | null {
  if (link.type === "NONE") {
    return null
  }

  if (link.type === "URL") {
    return link.url
  }

  if (link.type === "EVENT") {
    return `/arrangementer/${link.eventId}`
  }

  if (link.type === "GROUP") {
    return `/grupper/${link.groupSlug}`
  }

  if (link.type === "USER") {
    return `/brukere/${link.userId}`
  }

  if (link.type === "JOB_LISTING") {
    return `/karriere/${link.jobListingId}`
  }

  if (link.type === "OFFLINE") {
    return "/offline"
  }

  return null
}

export function formatDeleteConfirmText(recipientCount: number | undefined): string {
  if (recipientCount === undefined) {
    return "Er du sikker på at du vil slette denne varslingen? Mottakerne vil ikke lenger se den."
  }

  if (recipientCount === 1) {
    return "Er du sikker på at du vil slette denne varslingen? Den er sendt til 1 mottaker, som ikke lenger vil se den."
  }

  return `Er du sikker på at du vil slette denne varslingen? Den er sendt til ${recipientCount} mottakere, som ikke lenger vil se den.`
}
