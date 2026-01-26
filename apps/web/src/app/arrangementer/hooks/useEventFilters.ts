"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"
import type { EventType, GroupId } from "@dotkomonline/types"
import type { EventListViewMode } from "../components/EventList"

export interface EventFilters {
  search: string
  types: EventType[]
  groups: GroupId[]
  viewMode: EventListViewMode
}

export const useEventFilters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters: EventFilters = useMemo(() => {
    return {
      search: searchParams.get("q") ?? "",
      types: (searchParams.getAll("type") as EventType[]) ?? [],
      groups: (searchParams.getAll("group") as GroupId[]) ?? [],
      viewMode: (searchParams.get("sort") as EventListViewMode) ?? "ATTENDANCE",
    }
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
