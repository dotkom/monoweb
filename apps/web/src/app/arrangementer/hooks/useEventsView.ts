"use client"

import { useSearchParams } from "next/navigation"
import { useMemo } from "react"

export type EventsView = "cards" | "list" | "month" | "week"

export const useEventsView = () => {
  const searchParams = useSearchParams()

  const view = useMemo<EventsView>(() => {
    const viewParameter = searchParams.get("view")

    if (viewParameter === "month" || viewParameter === "week") {
      return viewParameter
    }

    if (viewParameter === "list") {
      return "list"
    }

    return "cards"
  }, [searchParams])

  return {
    view,
    isCards: view === "cards",
    isList: view === "list",
    isCalendar: view === "month" || view === "week",
    isMonth: view === "month",
    isWeek: view === "week",
  }
}
