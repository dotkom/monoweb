export const ALL_EVENTS_CALENDAR_PATH = "/api/calendar/all"
export const PERSONAL_CALENDAR_TOKEN_PATH = "/api/calendar/me"
export const PERSONAL_CALENDAR_SUBSCRIPTION_PATH = "/api/calendar/subscription"

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
  url.protocol = "webcal:"
  return url.toString()
}

export function createGoogleCalendarSubscribeUrl(calendarUrl: string) {
  const googleCalendarUrl = new URL("https://calendar.google.com/calendar/render")
  googleCalendarUrl.searchParams.set("cid", calendarUrl)
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
