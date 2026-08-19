import { secondsInDay } from "date-fns/constants"

export const EVENT_VIEW_COOKIE_NAME = "event_list_view_mode"

const EVENT_VIEW_COOKIE_MAX_AGE_SECONDS = 365 * secondsInDay

export type EventsListViewMode = "cards" | "list"

export const parseEventsListViewMode = (value: string | undefined): EventsListViewMode => {
  if (value === "list") {
    return "list"
  }

  return "cards"
}

export const setEventsListViewCookie = (view: EventsListViewMode) => {
  // biome-ignore lint/suspicious/noDocumentCookie: CookieStore unsupported in Safari/Firefox
  document.cookie = `${EVENT_VIEW_COOKIE_NAME}=${view}; path=/arrangementer; max-age=${EVENT_VIEW_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}
