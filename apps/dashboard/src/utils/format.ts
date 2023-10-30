const dateFormatter = new Intl.DateTimeFormat("no-NB", {
  day: "numeric",
  month: "short",
  weekday: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

export const formatDate = (date: Date) => dateFormatter.format(date)

// example: 19. oktober 2023 23:54 (23 timer, 50 minutter)
// writes two metrics, e.g. 1 year, 2 months or 3 weeks, 4 days
export function formatRemainingTime(targetDate: Date) {
  const now = Date.now()
  const remaining = targetDate.getTime() - now

  const years = Math.floor(remaining / (1000 * 60 * 60 * 24 * 365))
  const months = Math.floor((remaining / (1000 * 60 * 60 * 24 * 30)) % 12)
  const weeks = Math.floor((remaining / (1000 * 60 * 60 * 24 * 7)) % 4)
  const days = Math.floor((remaining / (1000 * 60 * 60 * 24)) % 7)
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24)

  if (remaining < 0) {
    return targetDate.toLocaleDateString("nb-NO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  let timeString = targetDate.toLocaleDateString("nb-NO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Determine which two metrics to display
  if (years > 0) {
    timeString += ` (${years} år, ${months} måneder)`
  } else if (months > 0) {
    timeString += ` (${months} måneder, ${weeks} uker)`
  } else if (weeks > 0) {
    timeString += ` (${weeks} uker, ${days} dager)`
  } else {
    timeString += ` (${days} dager, ${hours} timer)`
  }

  return timeString
}
