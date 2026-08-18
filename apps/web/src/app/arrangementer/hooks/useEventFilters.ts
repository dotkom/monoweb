"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo } from "react"
import { EventTypeSchema } from "@dotkomonline/rpc/event"
import { GroupSchema } from "@dotkomonline/rpc/group"
import { persistFilters, readPersistedFilters } from "@dotkomonline/utils/persistent-filters"
import { EventListOrderSchema } from "../components/EventList"
import { readPersistedEventView } from "./useEventsView"
import { z } from "zod"

const EventFiltersSchema = z.object({
  search: z.string(),
  types: z.array(EventTypeSchema),
  groups: z.array(GroupSchema.shape.slug),
  order: EventListOrderSchema,
})

type EventFilters = z.infer<typeof EventFiltersSchema>

const EVENT_SORT_STORAGE_KEY = "online:event-sort:v1"

const DEFAULT_EVENT_FILTERS = {
  search: "",
  types: [],
  groups: [],
  order: "ATTENDANCE",
} as const satisfies EventFilters

const isCalendarView = (params: URLSearchParams) => {
  const view = params.get("view")

  if (view === "month" || view === "week") {
    return true
  }

  return false
}

const writeFiltersToParameters = (params: URLSearchParams, filters: EventFilters) => {
  params.delete("q")

  if (filters.search) {
    params.set("q", filters.search)
  }

  params.delete("type")

  for (const type of filters.types) {
    params.append("type", type)
  }

  params.delete("group")

  for (const group of filters.groups) {
    params.append("group", group)
  }

  params.delete("sort")

  if (filters.order !== "ATTENDANCE") {
    params.set("sort", filters.order)
  }
}

const isDefaultSort = (sort: EventFilters["order"]) => sort === DEFAULT_EVENT_FILTERS.order

const parsePersistedSort = (value: unknown) => {
  const result = EventListOrderSchema.safeParse(value)

  if (!result.success) {
    return null
  }

  return result.data
}

export const useEventFilters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters: EventFilters = useMemo(() => {
    return EventFiltersSchema.parse({
      search: searchParams.get("q") ?? "",
      types: searchParams.getAll("type"),
      groups: searchParams.getAll("group"),
      order: searchParams.get("sort") ?? "ATTENDANCE",
    })
  }, [searchParams])

  useEffect(() => {
    if (isCalendarView(searchParams)) {
      return
    }

    if (!searchParams.has("view")) {
      const persistedView = readPersistedEventView()

      if (persistedView === "month" || persistedView === "week") {
        return
      }
    }

    if (searchParams.has("sort")) {
      persistFilters(EVENT_SORT_STORAGE_KEY, filters.order, isDefaultSort)

      return
    }

    const persistedSort = readPersistedFilters(EVENT_SORT_STORAGE_KEY, parsePersistedSort)

    if (!persistedSort) {
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", persistedSort)

    router.replace(`?${params.toString()}`, { scroll: false })
  }, [filters, router, searchParams])

  const updateFilters = useCallback(
    (partial: Partial<EventFilters>) => {
      const params = new URLSearchParams(searchParams.toString())

      const next = { ...filters, ...partial }

      if (partial.order !== undefined) {
        persistFilters(EVENT_SORT_STORAGE_KEY, next.order, isDefaultSort)
      }

      writeFiltersToParameters(params, next)

      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams, filters]
  )

  const resetFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("q")
    params.delete("type")
    params.delete("group")
    params.delete("sort")

    persistFilters(EVENT_SORT_STORAGE_KEY, DEFAULT_EVENT_FILTERS.order, isDefaultSort)

    router.replace(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  return {
    filters,
    updateFilters,
    resetFilters,
  }
}
