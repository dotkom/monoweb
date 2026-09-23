export const FEIDE_LINK_NUDGE_DISMISSED_STORAGE_KEY = "feide-link-nudge-dismissed"

export function isFeideLinkNudgeDismissed() {
  if (typeof window === "undefined") {
    return false
  }

  return localStorage.getItem(FEIDE_LINK_NUDGE_DISMISSED_STORAGE_KEY) === "1"
}

export function dismissFeideLinkNudge() {
  localStorage.setItem(FEIDE_LINK_NUDGE_DISMISSED_STORAGE_KEY, "1")
}
