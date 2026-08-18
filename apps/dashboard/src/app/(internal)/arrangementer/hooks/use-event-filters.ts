"use client"

import { persistFilters, readPersistedFilters } from "@dotkomonline/utils/persistent-filters"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo } from "react"
import { z } from "zod"

const EventPreferencesSchema = z.object({
  timeTab: z.enum(["kommende", "tidligere"]),
  scope: z.enum(["alle", "mine"]),
})

type EventPreferences = z.infer<typeof EventPreferencesSchema>
type EventFilters = EventPreferences & { search: string }

const EVENT_FILTERS_STORAGE_KEY = "online-dashboard:event-filters:v1"

const DEFAULT_EVENT_PREFERENCES = {
  timeTab: "kommende",
  scope: "alle",
} as const satisfies EventPreferences

const hasPreferenceParameters = (params: URLSearchParams) => params.has("tab") || params.has("scope")

const parseTimeTab = (value: string | null): EventFilters["timeTab"] => {
  if (value === "tidligere") {
    return "tidligere"
  }

  return DEFAULT_EVENT_PREFERENCES.timeTab
}

const parseScope = (value: string | null): EventFilters["scope"] => {
  if (value === "mine") {
    return "mine"
  }

  return DEFAULT_EVENT_PREFERENCES.scope
}

const writeFiltersToParameters = (params: URLSearchParams, filters: EventFilters) => {
  params.delete("q")

  if (filters.search) {
    params.set("q", filters.search)
  }

  params.delete("tab")

  if (filters.timeTab !== DEFAULT_EVENT_PREFERENCES.timeTab) {
    params.set("tab", filters.timeTab)
  }

  params.delete("scope")

  if (filters.scope !== DEFAULT_EVENT_PREFERENCES.scope) {
    params.set("scope", filters.scope)
  }
}

const getPreferences = (filters: EventFilters): EventPreferences => ({
  timeTab: filters.timeTab,
  scope: filters.scope,
})

const isDefaultPreferences = (preferences: EventPreferences) => {
  return (
    preferences.timeTab === DEFAULT_EVENT_PREFERENCES.timeTab && preferences.scope === DEFAULT_EVENT_PREFERENCES.scope
  )
}

const parsePersistedPreferences = (value: unknown) => {
  const result = EventPreferencesSchema.safeParse(value)

  if (!result.success) {
    return null
  }

  return result.data
}

export const useEventFilters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters = useMemo<EventFilters>(
    () => ({
      search: searchParams.get("q") ?? "",
      timeTab: parseTimeTab(searchParams.get("tab")),
      scope: parseScope(searchParams.get("scope")),
    }),
    [searchParams]
  )

  useEffect(() => {
    if (hasPreferenceParameters(searchParams)) {
      persistFilters(EVENT_FILTERS_STORAGE_KEY, getPreferences(filters), isDefaultPreferences)

      return
    }

    const persistedPreferences = readPersistedFilters(EVENT_FILTERS_STORAGE_KEY, parsePersistedPreferences)

    if (!persistedPreferences) {
      return
    }

    persistFilters(EVENT_FILTERS_STORAGE_KEY, persistedPreferences, isDefaultPreferences)

    if (isDefaultPreferences(persistedPreferences)) {
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    writeFiltersToParameters(params, { ...filters, ...persistedPreferences })

    router.replace(`/arrangementer?${params.toString()}`, { scroll: false })
  }, [filters, router, searchParams])

  const updateFilters = useCallback(
    (partial: Partial<EventFilters>) => {
      const nextFilters = { ...filters, ...partial }
      const params = new URLSearchParams(searchParams.toString())

      persistFilters(EVENT_FILTERS_STORAGE_KEY, getPreferences(nextFilters), isDefaultPreferences)
      writeFiltersToParameters(params, nextFilters)

      router.replace(`/arrangementer?${params.toString()}`, { scroll: false })
    },
    [filters, router, searchParams]
  )

  return {
    filters,
    updateFilters,
  }
}
