import { TZDate } from "@date-fns/tz"
import type { UserRouter } from "@dotkomonline/rpc"
import { getCurrentUTC } from "@dotkomonline/utils"
import { isWithinInterval } from "date-fns"

export const FEIDE_LINK_NUDGE_DISMISSED_STORAGE_KEY = "feide-link-nudge-dismissed"

export const feideLinkNudgeInterval = {
  start: TZDate.tz("Europe/Oslo", 2026, 7, 10, 6, 0, 0),
  end: TZDate.tz("Europe/Oslo", 2026, 7, 14, 23, 59, 59),
}

export function isFeideLinkNudgeActiveNow() {
  return isWithinInterval(getCurrentUTC(), feideLinkNudgeInterval)
}

export function shouldPromptFeideLink(auth0Connections: UserRouter.GetAuth0ConnectionsOutput | undefined) {
  if (auth0Connections === undefined) {
    return false
  }

  return auth0Connections.hasUsernamePassword && !auth0Connections.hasFeide
}

export function isFeideLinkNudgeDismissed() {
  if (typeof window === "undefined") {
    return false
  }

  return localStorage.getItem(FEIDE_LINK_NUDGE_DISMISSED_STORAGE_KEY) === "1"
}

export function dismissFeideLinkNudge() {
  localStorage.setItem(FEIDE_LINK_NUDGE_DISMISSED_STORAGE_KEY, "1")
}
