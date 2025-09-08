import type { EventId } from "@dotkomonline/types"
import { slugify } from "./slugify"

export const createEventSlug = (eventTitle: string): string => {
  return slugify(eventTitle)
}

export const createEventUrl = (eventId: EventId, eventTitle?: string): `/arrangementer/${string}/${EventId}` => {
  const slug = eventTitle ? createEventSlug(eventTitle) : "arrangement"

  return `/arrangementer/${slug}/${eventId}`
}

export const createAbsoluteEventUrl = (
  origin: string,
  eventId: EventId,
  eventTitle?: string
): `${string}/arrangementer/${string}/${EventId}` => {
  const slug = eventTitle ? createEventSlug(eventTitle) : "arrangement"

  return `${origin}/arrangementer/${slug}/${eventId}`
}
