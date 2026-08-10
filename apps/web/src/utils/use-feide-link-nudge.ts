"use client"

import type { UserRouter } from "@dotkomonline/rpc"
import { useEffect, useState } from "react"
import {
  dismissFeideLinkNudge,
  isFeideLinkNudgeActiveNow,
  isFeideLinkNudgeDismissed,
  shouldPromptFeideLink,
} from "./feide-link-nudge"

type UseFeideLinkNudgeOptions = {
  auth0Connections: UserRouter.GetAuth0ConnectionsOutput | undefined
  auth0ConnectionsIsLoading: boolean
}

export function useFeideLinkNudge({ auth0Connections, auth0ConnectionsIsLoading }: UseFeideLinkNudgeOptions) {
  const [isDismissed, setIsDismissed] = useState(true)
  const [hasLoadedDismissPreference, setHasLoadedDismissPreference] = useState(false)

  useEffect(() => {
    setIsDismissed(isFeideLinkNudgeDismissed())
    setHasLoadedDismissPreference(true)
  }, [])

  const showNudge =
    hasLoadedDismissPreference &&
    !auth0ConnectionsIsLoading &&
    isFeideLinkNudgeActiveNow() &&
    shouldPromptFeideLink(auth0Connections) &&
    !isDismissed

  const dismissNudge = () => {
    dismissFeideLinkNudge()
    setIsDismissed(true)
  }

  return {
    showNudge,
    dismissNudge,
    hasLoadedDismissPreference,
  }
}
