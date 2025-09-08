import { slugify } from "./slugify"

export const createEventSlug = (eventTitle: string): string => {
  return slugify(eventTitle)
}

export const createEventUrl = (eventId: string, eventTitle?: string): `/arrangementer/${string}/${string}` => {
  const slug = eventTitle ? createEventSlug(eventTitle) : "arrangement"

  return `/arrangementer/${slug}/${eventId}`
}

export const createAbsoluteEventUrl = (
  origin: string,
  eventId: string,
  eventTitle?: string
): `${string}/arrangementer/${string}/${string}` => {
  const slug = eventTitle ? createEventSlug(eventTitle) : "arrangement"

  return `${origin}/arrangementer/${slug}/${eventId}`
}
