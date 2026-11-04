"use client"

import { useEffect, useState } from "react"
import { setJobListingViewCookie, type JobListingViewMode } from "./jobListingViewCookie"

export const useJobListingsView = (initialViewMode: JobListingViewMode) => {
  const [view, setView] = useState<JobListingViewMode>(initialViewMode)

  useEffect(() => {
    setJobListingViewCookie(view)
  }, [view])

  return {
    view,
    isCards: view === "cards",
    setView,
  }
}
