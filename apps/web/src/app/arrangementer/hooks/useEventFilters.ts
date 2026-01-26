"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"
import { EventTypeSchema, GroupSchema } from "@dotkomonline/types"
import { EventListViewModeSchema } from "../components/EventList"
import { z } from "zod"

const EventFiltersSchema = z.object({
  search: z.string(),
  types: z.array(EventTypeSchema),
  groups: z.array(GroupSchema.shape.slug),
  viewModeSort: EventListViewModeSchema,
})

// Type inferred from schema
type EventFilters = z.infer<typeof EventFiltersSchema>

export const useEventFilters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters: EventFilters = useMemo(() => {
    return EventFiltersSchema.parse({
      search: searchParams.get("q") ?? "",
      types: searchParams.getAll("type"),
      groups: searchParams.getAll("group"),
      viewModeSort: searchParams.get("sort") ?? "ATTENDANCE",
    })
  }, [searchParams])

  const updateFilters = useCallback(
    (partial: Partial<EventFilters>) => {
      const params = new URLSearchParams(searchParams.toString())

      const next = { ...filters, ...partial }

      // search
      params.delete("q")
      if (next.search) params.set("q", next.search)

      // types
      params.delete("type")
      for (const t of next.types) {
        params.append("type", t)
      }

      // groups
      params.delete("group")
      for (const g of next.groups) {
        params.append("group", g)
      }

      // sort
      params.delete("sort")
      if (next.viewMode !== "ATTENDANCE") {
        params.set("sort", next.viewMode)
      }

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
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  return {
    filters,
    updateFilters,
    resetFilters,
  }
}
