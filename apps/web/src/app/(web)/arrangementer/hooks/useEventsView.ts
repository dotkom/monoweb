"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { type EventsListViewMode, setEventsListViewCookie } from "./eventViewCookie"
import { clearEventFilterParams } from "../utils/event-filters"

export type EventsView = "cards" | "list" | "month" | "week"

const isEventsView = (value: string | null): value is EventsView =>
  value === "cards" || value === "list" || value === "month" || value === "week"

const clearCalendarParams = (params: URLSearchParams) => {
  params.delete("y")
  params.delete("m")
  params.delete("week")
}

/** View from the URL, falling back to the last list layout (stored in a cookie for SSR) */
export const useEventsView = (initialListViewMode: EventsListViewMode) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [listViewMode, setListViewMode] = useState(initialListViewMode)

  const viewParam = searchParams.get("view")
  const view: EventsView = isEventsView(viewParam) ? viewParam : listViewMode

  useEffect(() => {
    if (view === "list" || view === "cards") {
      setEventsListViewCookie(view)
    }
  }, [view])

  const setView = useCallback(
    (nextView: EventsView) => {
      const params = new URLSearchParams(searchParams.toString())
      // new view always starts on the current month/week
      clearCalendarParams(params)

      if (nextView === "month" || nextView === "week") {
        // calendar don't use list filters
        clearEventFilterParams(params)
      } else {
        setListViewMode(nextView)
      }

      if (nextView === "cards") {
        // cards view is default, so remove the view parameter
        params.delete("view")
      } else {
        params.set("view", nextView)
      }

      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  return {
    view,
    setView,
    isCalendar: view === "month" || view === "week",
  }
}
