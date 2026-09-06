export const ALL_EVENTS_CALENDAR_PATH = "/api/calendar/all.ics"
export const PERSONAL_CALENDAR_TOKEN_PATH = "/api/calendar/me"
export const PERSONAL_CALENDAR_SUBSCRIPTION_PATH = "/api/calendar/subscription.ics"

export function createAllEventsCalendarUrl(origin: string) {
  return new URL(ALL_EVENTS_CALENDAR_PATH, origin).toString()
}

export function createPersonalCalendarSubscriptionUrl(origin: string, token: string) {
  const url = new URL(PERSONAL_CALENDAR_SUBSCRIPTION_PATH, origin)
  url.searchParams.set("key", token)
  return url.toString()
}

export function createWebcalUrl(calendarUrl: string) {
  const url = new URL(calendarUrl)

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Calendar URL must use HTTP or HTTPS")
  }

  return `webcal://${url.host}${url.pathname}${url.search}${url.hash}`
}

export function createGoogleCalendarSubscribeUrl(calendarUrl: string) {
  const googleCalendarUrl = new URL("https://calendar.google.com/calendar/r")
  googleCalendarUrl.searchParams.set("cid", createWebcalUrl(calendarUrl))
  return googleCalendarUrl.toString()
}

export async function fetchPersonalCalendarToken() {
  const response = await fetch(PERSONAL_CALENDAR_TOKEN_PATH)

  if (!response.ok) {
    throw new Error("Could not create personal calendar link")
  }

  const payload: unknown = await response.json()

  if (!isCalendarTokenPayload(payload)) {
    throw new Error("Could not create personal calendar link")
  }

  return payload.token
}

function isCalendarTokenPayload(payload: unknown): payload is { token: string } {
  return typeof payload === "object" && payload !== null && "token" in payload && typeof payload.token === "string"
}
