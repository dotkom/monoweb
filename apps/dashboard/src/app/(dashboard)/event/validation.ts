import * as tz from "@date-fns/tz"
import type { EventWrite } from "@dotkomonline/types"
import { isBefore } from "date-fns"
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
    return url.hostname === "maps.google.com" || url.hostname === "use.mazemap.com"
  } catch (e) {
    return false
  }
}

export const validateEventWrite = (event: EventWrite): z.ZodIssue[] => {
  const issues: z.ZodIssue[] = []
  const localTimeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone
  const now = tz.tz(localTimeZone)(Date.now())

  if (isBefore(event.start, now)) {
    issues.push({ code: "custom", message: "Starttidspunkt må være i fremtiden", path: ["start"] })
  }

  if (isBefore(event.end, now)) {
    issues.push({ code: "custom", message: "Sluttidspunkt må være i fremtiden", path: ["end"] })
  }

  if (isBefore(event.end, event.start)) {
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
