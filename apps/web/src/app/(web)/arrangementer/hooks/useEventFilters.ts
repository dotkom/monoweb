"use client"

import { useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"
import {
  type EventFilters,
  clearEventFilterParams,
  parseEventFilters,
  writeEventFilterParams,
} from "../utils/event-filters"

export const useEventFilters = () => {
  const searchParams = useSearchParams()
  const filters = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString())

    return parseEventFilters(params)
  }, [searchParams])

  const updateFilters = useCallback((partial: Partial<EventFilters>) => {
    // Read the current URL so consecutive clicks also preserve updates made before React rerenders.
    const url = new URL(window.location.href)

    writeEventFilterParams(url.searchParams, {
      ...parseEventFilters(url.searchParams),
      ...partial,
    })

    // This keeps useSearchParams in sync without a server navigation
    window.history.replaceState(null, "", url)
  }, [])

  const resetFilters = useCallback(() => {
    const url = new URL(window.location.href)

    clearEventFilterParams(url.searchParams)

    window.history.replaceState(null, "", url)
  }, [])

  return { filters, updateFilters, resetFilters }
}
