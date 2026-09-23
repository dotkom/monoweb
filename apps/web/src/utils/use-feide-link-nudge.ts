"use client"

import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import { useEffect, useState } from "react"
import { dismissFeideLinkNudge, isFeideLinkNudgeDismissed } from "./feide-link-nudge"

export function useFeideLinkNudge() {
  const { sessionUser, isLoading: isSessionLoading } = useAuthenticatedUser()
  const [isDismissed, setIsDismissed] = useState(true)
  const [hasLoadedDismissPreference, setHasLoadedDismissPreference] = useState(false)

  useEffect(() => {
    setIsDismissed(isFeideLinkNudgeDismissed())
    setHasLoadedDismissPreference(true)
  }, [])

  const duplicateUserId = sessionUser?.duplicateUserId
  const showNudge =
    hasLoadedDismissPreference &&
    !isSessionLoading &&
    typeof duplicateUserId === "string" &&
    duplicateUserId.length > 0 &&
    !isDismissed

  const dismissNudge = () => {
    dismissFeideLinkNudge()
    setIsDismissed(true)
  }

  return {
    showNudge,
    duplicateUserId: showNudge ? duplicateUserId : undefined,
    dismissNudge,
    hasLoadedDismissPreference,
  }
}
