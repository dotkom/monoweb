"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo } from "react"
import { persistFilters, readPersistedFilters } from "@dotkomonline/utils/persistent-filters"

export type EventsView = "cards" | "list" | "month" | "week"

const EVENT_VIEW_STORAGE_KEY = "online:event-view:v1"

const isDefaultView = (view: EventsView) => view === "cards"

const parsePersistedView = (value: unknown): EventsView | null => {
  if (value === "cards" || value === "list" || value === "month" || value === "week") {
    return value
  }

  return null
}

const hasEventFilterParameters = (params: URLSearchParams) => {
  return params.has("q") || params.has("type") || params.has("group") || params.has("sort")
}

export const persistEventView = (view: EventsView) => {
  persistFilters(EVENT_VIEW_STORAGE_KEY, view, isDefaultView)
}

export const readPersistedEventView = () => {
  return readPersistedFilters(EVENT_VIEW_STORAGE_KEY, parsePersistedView)
}

export const useEventsView = () => {
  const router = useRouter()
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

  useEffect(() => {
    if (searchParams.has("view")) {
      persistEventView(view)

      return
    }

    const persistedView = readPersistedEventView()

    if (hasEventFilterParameters(searchParams) && persistedView !== "list") {
      persistEventView("cards")

      return
    }

    if (!persistedView) {
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.set("view", persistedView)

    router.replace(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams, view])

  return {
    view,
    isCards: view === "cards",
    isList: view === "list",
    isCalendar: view === "month" || view === "week",
    isMonth: view === "month",
    isWeek: view === "week",
  }
}
