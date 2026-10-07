"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { setEventsListViewCookie, type EventsListViewMode } from "./eventViewCookie"

export type EventsView = "cards" | "list" | "month" | "week"

export const useEventsView = (initialListViewMode: EventsListViewMode) => {
  const searchParams = useSearchParams()
  const [listViewMode, setListViewMode] = useState<EventsListViewMode>(initialListViewMode)

  const view = useMemo<EventsView>(() => {
    const viewParameter = searchParams.get("view")

    if (
      viewParameter === "month" ||
      viewParameter === "week" ||
      viewParameter === "list" ||
      viewParameter === "cards"
    ) {
      return viewParameter
    }

    return listViewMode
  }, [searchParams, listViewMode])

  useEffect(() => {
    if (view === "list" || view === "cards") {
      setEventsListViewCookie(view)
    }
  }, [view])

  return {
    view,
    isCards: view === "cards",
    isList: view === "list",
    isCalendar: view === "month" || view === "week",
    isMonth: view === "month",
    isWeek: view === "week",
    setListViewMode,
  }
}
