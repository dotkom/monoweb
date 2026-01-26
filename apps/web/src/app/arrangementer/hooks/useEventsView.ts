"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"

export type EventsView = "list" | "cal"

export const useEventsView = () => {
  const searchParams = useSearchParams()

  const view = useMemo<EventsView>(() => {
    const viewParam = searchParams.get("view")
    return viewParam === "cal" ? "cal" : "list"
  }, [searchParams])

  return {
    view,
    isList: view === "list",
    isCalendar: view === "cal",
  }
}
