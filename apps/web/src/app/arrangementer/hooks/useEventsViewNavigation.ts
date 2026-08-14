"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import type { EventsView } from "./useEventsView"

const clearEventFilterParameters = (queryParameters: URLSearchParams) => {
  queryParameters.delete("q")
  queryParameters.delete("type")
  queryParameters.delete("group")
  queryParameters.delete("sort")
}

const clearCalendarParameters = (queryParameters: URLSearchParams) => {
  queryParameters.delete("y")
  queryParameters.delete("m")
  queryParameters.delete("week")
}

export const useEventsViewNavigation = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateToView = useCallback(
    (nextView: EventsView) => {
      const queryParameters = new URLSearchParams(searchParams.toString())

      if (nextView === "month") {
        queryParameters.set("view", "month")
        queryParameters.delete("week")
        clearEventFilterParameters(queryParameters)
      } else if (nextView === "week") {
        queryParameters.set("view", "week")
        queryParameters.delete("y")
        queryParameters.delete("m")
        clearEventFilterParameters(queryParameters)
      } else if (nextView === "list") {
        queryParameters.set("view", "list")
        clearCalendarParameters(queryParameters)
      } else {
        queryParameters.delete("view")
        clearCalendarParameters(queryParameters)
      }

      router.replace(`?${queryParameters.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  return {
    navigateToView,
  }
}
