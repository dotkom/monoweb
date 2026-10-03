import { secondsInDay } from "date-fns/constants"

export const NAVIGATION_GROUPS_COLLAPSED_COOKIE_NAME = "dashboard_nav_groups_collapsed"

const NAVIGATION_GROUPS_COLLAPSED_COOKIE_MAX_AGE_SECONDS = 365 * secondsInDay

export function parseNavigationGroupsCollapsedCookie(value: string | undefined): string[] {
  if (value === undefined || value.length === 0) {
    return []
  }

  return value
    .split(",")
    .map((label) => decodeURIComponent(label.trim()))
    .filter((label) => label.length > 0)
}

export function setNavigationGroupsCollapsedCookie(collapsedLabels: string[]) {
  const value = collapsedLabels.map((label) => encodeURIComponent(label)).join(",")

  // biome-ignore lint/suspicious/noDocumentCookie: CookieStore unsupported in Safari/Firefox
  document.cookie = `${NAVIGATION_GROUPS_COLLAPSED_COOKIE_NAME}=${value}; path=/; max-age=${NAVIGATION_GROUPS_COLLAPSED_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}
