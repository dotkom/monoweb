import { secondsInDay } from "date-fns/constants"

export const COMPLETION_HIGHLIGHT_HIDDEN_COOKIE_NAME = "completion_card_highlight_hidden"

const COMPLETION_HIGHLIGHT_HIDDEN_COOKIE_MAX_AGE_SECONDS = 365 * secondsInDay

export const getCompletionHighlightHiddenFromCookie = (): boolean => {
  if (typeof document === "undefined") {
    return false
  }

  const cookiePrefix = `${COMPLETION_HIGHLIGHT_HIDDEN_COOKIE_NAME}=`
  const cookieEntry = document.cookie.split("; ").find((entry) => entry.startsWith(cookiePrefix))

  if (cookieEntry === undefined) {
    return false
  }

  return cookieEntry.slice(cookiePrefix.length) === "true"
}

export const setCompletionHighlightHiddenCookie = (hidden: boolean) => {
  // biome-ignore lint/suspicious/noDocumentCookie: CookieStore unsupported in Safari/Firefox
  document.cookie = `${COMPLETION_HIGHLIGHT_HIDDEN_COOKIE_NAME}=${hidden ? "true" : "false"}; path=/arrangementer; max-age=${COMPLETION_HIGHLIGHT_HIDDEN_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}
