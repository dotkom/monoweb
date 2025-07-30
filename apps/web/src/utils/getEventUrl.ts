import type { EventId } from "@dotkomonline/types"
import { slugify } from "@dotkomonline/utils"

export const getEventSlug = (eventTitle: string): string => {
  return slugify(eventTitle)
}

export const getEventUrl = (eventId: EventId, eventTitle?: string): `/arrangementer/${string}/${EventId}` => {
  const slug = eventTitle ? getEventSlug(eventTitle) : "arrangement"

  return `/arrangementer/${slug}/${eventId}`
}
