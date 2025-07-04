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
    return (
      url.hostname === "use.mazemap.com" ||
      url.hostname === "maps.app.goo.gl" ||
      (url.href.startsWith("https://www.google.") && url.pathname.startsWith("/maps/place/"))
    )
  } catch (e) {
    return false
  }
}

export const validateEventWrite = (event: EventWrite): z.ZodIssue[] => {
  const issues: z.ZodIssue[] = []

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
