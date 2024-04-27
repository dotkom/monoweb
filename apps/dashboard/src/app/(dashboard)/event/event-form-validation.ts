import type { EventWrite } from "@dotkomonline/types"

const validateLocationLink = (value: string | null) => {
  if (value === null) {
    return true
  }
  if (!value.includes("google") && !value.includes("mazemap")) {
    return false
  }
  return true
}

type CustomIssue = {
  code: "custom"
  message: string
  path: string[]
}

export const validateEvent = (event: EventWrite): CustomIssue[] => {
  const issues: CustomIssue[] = []
  if (event.start < new Date()) {
    issues.push({ code: "custom", message: "Starttidspunkt må være i fremtiden", path: ["start"] })
  }

  if (event?.end < new Date()) {
    issues.push({ code: "custom", message: "Sluttidspunkt må være i fremtiden", path: ["end"] })
  }

  if (event?.start >= event?.end) {
    issues.push({ code: "custom", message: "Sluttidspunkt må være etter starttidspunkt", path: ["end"] })
  }

  if (event?.locationLink?.length && !validateLocationLink(event?.locationLink)) {
    issues.push({
      code: "custom",
      message: "Lenken må være en gyldig Google Maps eller MazeMap-lenke",
      path: ["locationLink"],
    })
  }

  return issues
}
