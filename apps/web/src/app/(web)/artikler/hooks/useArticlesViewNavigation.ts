"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import type { ArticlesView } from "./useArticlesView"
import type { ArticleListViewMode } from "./articleViewCookie"

export const useArticlesViewNavigation = (onListViewModeChange: (mode: ArticleListViewMode) => void) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateToView = useCallback(
    (nextView: ArticlesView) => {
      const queryParameters = new URLSearchParams(searchParams.toString())

      if (nextView === "list") {
        queryParameters.set("view", "list")
        onListViewModeChange("list")
      } else {
        queryParameters.delete("view")
        onListViewModeChange("cards")
      }

      router.replace(`?${queryParameters.toString()}`, { scroll: false })
    },
    [router, searchParams, onListViewModeChange]
  )

  return {
    navigateToView,
  }
}
