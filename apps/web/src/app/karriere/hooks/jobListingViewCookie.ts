import { secondsInDay } from "date-fns/constants"

export const JOB_LISTING_VIEW_COOKIE_NAME = "job_listing_view_mode"

const JOB_LISTING_VIEW_COOKIE_MAX_AGE_SECONDS = 365 * secondsInDay

export type JobListingViewMode = "cards" | "list"

export const parseJobListingViewMode = (value: string | undefined): JobListingViewMode => {
  if (value === "cards") {
    return "cards"
  }

  return "list"
}

export const setJobListingViewCookie = (view: JobListingViewMode) => {
  // biome-ignore lint/suspicious/noDocumentCookie: CookieStore unsupported in Safari/Firefox
  document.cookie = `${JOB_LISTING_VIEW_COOKIE_NAME}=${view}; path=/karriere; max-age=${JOB_LISTING_VIEW_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}
