import { type CountdownFormatterData, zeroPad } from "./use-countdown"

export function formatNumericalTimeLeft(countdown: CountdownFormatterData): string {
  if (countdown === "NOW") {
    return "00:00:00"
  }

  const years = countdown.years ? zeroPad(countdown.years, 2) : null
  const months = countdown.months ? zeroPad(countdown.months, 2) : null
  const days = countdown.days ? zeroPad(countdown.days, 2) : null
  const hours = zeroPad(countdown.hours)
  const minutes = zeroPad(countdown.minutes)
  const seconds = zeroPad(countdown.seconds)

  let string = ""

  if (years) {
    string += `${years} år `
  }

  if (months) {
    string += `${months} mnd `
  }

  if (days) {
    string += `${days} dgr `
  }

  return `${string}${hours}:${minutes}:${seconds}`
}
