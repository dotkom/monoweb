"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export type EventsView = "list" | "cal"

export const useEventsViewNavigation = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateToView = useCallback(
    (nextView: EventsView) => {
      const params = new URLSearchParams(searchParams.toString())

      if (nextView === "cal") {
        params.set("view", "cal")
        // let them default to current year and month
        params.delete("y")
        params.delete("m")

        // clear filters
        params.delete("q")
        params.delete("type")
        params.delete("group")
        params.delete("sort")
      } else {
        // list view is default, remove calendar params
        params.delete("view")
        params.delete("y")
        params.delete("m")
      }

      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  return {
    navigateToView,
  }
}
