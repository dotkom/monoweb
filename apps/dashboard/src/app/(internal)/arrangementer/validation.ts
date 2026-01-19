import { EventStatusSchema, EventTypeSchema, type EventWrite } from "@dotkomonline/types"
import { isAfter } from "date-fns"
import type { z } from "zod"

/**
 * Determine using basic heuristics if a map points to Google Maps or Mazemap.
 */
const isValidMapUrl = (value: string | null) => {
  if (value === null) {
    return false
  }
  // If the value is a malformed URL, we can't check it and automatically deem
  // it invalid.
  try {
    const url = new URL(value)
    return (
      url.hostname === "use.mazemap.com" ||
      url.hostname === "link.mazemap.com" ||
      url.hostname === "maps.app.goo.gl" ||
      (url.href.startsWith("https://www.google.") && url.pathname.startsWith("/maps/place/"))
    )
  } catch (_e) {
    return false
  }
}

const MIN_TITLE_LENGTH = 2
const MIN_DESCRIPTION_LENGTH = 2

export const validateEventWrite = (event: EventWrite): z.ZodIssue[] => {
  const issues: z.ZodIssue[] = []

  if (!event.title || event.title.length < MIN_TITLE_LENGTH) {
    issues.push({ code: "custom", message: `Tittel må være minst ${MIN_TITLE_LENGTH} tegn lang`, path: ["title"] })
  }

  if (!event.description || event.description.length < MIN_DESCRIPTION_LENGTH) {
    issues.push({
      code: "custom",
      message: `Beskrivelse må være minst ${MIN_DESCRIPTION_LENGTH} tegn lang`,
      path: ["description"],
    })
  }

  const parsedEventType = EventTypeSchema.safeParse(event.type)
  if (!parsedEventType.success) {
    issues.push(...parsedEventType.error.issues)
  }

  const parsedEventStatus = EventStatusSchema.safeParse(event.status)
  if (!parsedEventStatus.success) {
    issues.push(...parsedEventStatus.error.issues)
  }

  if (!event.start || !event.end) {
    issues.push({ code: "custom", message: "Start- og sluttidspunkt må være satt", path: ["start", "end"] })
  }

  if (!isAfter(event.end, event.start)) {
    issues.push({ code: "custom", message: "Sluttidspunkt må være etter starttidspunkt", path: ["end"] })
  }

  if (event?.locationLink?.length && !isValidMapUrl(event?.locationLink)) {
    issues.push({
      code: "custom",
      message: "Lenken må være en gyldig Google Maps eller MazeMap-lenke",
      path: ["locationLink"],
    })
  }

  return issues
}
