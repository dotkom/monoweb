"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"

export type EventsView = "list" | "month" | "week"

export const useEventsView = () => {
  const searchParams = useSearchParams()

  const view = useMemo<EventsView>(() => {
    const viewParam = searchParams.get("view")
    if (viewParam === "month") return "month"
    if (viewParam === "week") return "week"
    return "list"
  }, [searchParams])

  return {
    view,
    isList: view === "list",
    isCalendar: view === "month" || view === "week",
    isMonth: view === "month",
    isWeek: view === "week",
  }
}
