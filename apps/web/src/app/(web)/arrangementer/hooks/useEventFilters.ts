"use client"

import { EventTypeSchema } from "@dotkomonline/rpc/event"
import { GroupSchema } from "@dotkomonline/rpc/group"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"
import { z } from "zod"
import { EventListViewModeSchema } from "../components/EventList"

const EventFiltersSchema = z.object({
  search: z.string(),
  types: z.array(EventTypeSchema),
  groups: z.array(GroupSchema.shape.slug),
  sort: EventListViewModeSchema,
  date: z.iso.date().nullable().catch(null),
})

export type EventFilters = z.infer<typeof EventFiltersSchema>

export const DEFAULT_EVENT_SORT = "ATTENDANCE" satisfies EventFilters["sort"]

const FILTER_PARAMS = ["q", "type", "group", "sort", "date"] as const

export const clearEventFilterParams = (params: URLSearchParams) => {
  for (const key of FILTER_PARAMS) {
    params.delete(key)
  }
}

const writeEventFilterParams = (params: URLSearchParams, filters: EventFilters) => {
  clearEventFilterParams(params)

  if (filters.search) {
    params.set("q", filters.search)
  }

  for (const type of filters.types) {
    params.append("type", type)
  }

  for (const group of filters.groups) {
    params.append("group", group)
  }

  if (filters.sort !== DEFAULT_EVENT_SORT) {
    params.set("sort", filters.sort)
  }

  if (filters.date) {
    params.set("date", filters.date)
  }
}

export const countActiveEventFilters = (filters: EventFilters) =>
  (filters.search ? 1 : 0) +
  filters.types.length +
  filters.groups.length +
  (filters.date ? 1 : 0) +
  (filters.sort !== DEFAULT_EVENT_SORT ? 1 : 0)

export const useEventFilters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters = useMemo(
    () =>
      EventFiltersSchema.parse({
        search: searchParams.get("q") ?? "",
        types: searchParams.getAll("type"),
        groups: searchParams.getAll("group"),
        sort: searchParams.get("sort") ?? DEFAULT_EVENT_SORT,
        date: searchParams.get("date"),
      }),
    [searchParams]
  )

  const updateFilters = useCallback(
    (partial: Partial<EventFilters>) => {
      const params = new URLSearchParams(searchParams.toString())
      writeEventFilterParams(params, { ...filters, ...partial })
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams, filters]
  )

  const resetFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    clearEventFilterParams(params)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  return { filters, updateFilters, resetFilters }
}
