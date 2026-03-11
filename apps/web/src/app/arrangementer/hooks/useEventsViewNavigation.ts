"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export type EventsView = "list" | "month" | "week"

export const useEventsViewNavigation = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateToView = useCallback(
    (nextView: EventsView) => {
      const params = new URLSearchParams(searchParams.toString())

      if (nextView === "month") {
        params.set("view", "month")
        // let y and m default to current year and month if not set
        params.delete("week")

        // clear list-specific filters
        params.delete("q")
        params.delete("type")
        params.delete("group")
        params.delete("sort")
      } else if (nextView === "week") {
        params.set("view", "week")
        // let week default to current week if not set
        params.delete("y")
        params.delete("m")

        // clear list-specific filters
        params.delete("q")
        params.delete("type")
        params.delete("group")
        params.delete("sort")
      } else {
        // list view is default, remove calendar params
        params.delete("view")
        params.delete("y")
        params.delete("m")
        params.delete("week")
      }

      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  return {
    navigateToView,
  }
}
