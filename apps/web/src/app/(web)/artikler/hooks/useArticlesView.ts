"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { setArticlesListViewCookie, type ArticleListViewMode } from "./articleViewCookie"

export type ArticlesView = "cards" | "list"

export const useArticlesView = (initialListViewMode: ArticleListViewMode) => {
  const searchParams = useSearchParams()
  const [listViewMode, setListViewMode] = useState<ArticleListViewMode>(initialListViewMode)

  const view = useMemo<ArticlesView>(() => {
    const viewParameter = searchParams.get("view")

    if (viewParameter === "list" || viewParameter === "cards") {
      return viewParameter
    }

    return listViewMode
  }, [searchParams, listViewMode])

  useEffect(() => {
    if (view === "list" || view === "cards") {
      setArticlesListViewCookie(view)
    }
  }, [view])

  return {
    view,
    isCards: view === "cards",
    isList: view === "list",
    setListViewMode,
  }
}
