"use client"

import type { Article } from "@dotkomonline/types"
import { createContext, useContext } from "react"

/** Context consisting of everything required to use and render the form */
export const ArticleDetailsContext = createContext<{
  article: Article
} | null>(null)

export const useArticleDetailsContext = () => {
  const ctx = useContext(ArticleDetailsContext)
  if (ctx === null) {
    throw new Error("useArticleDetailsContext called without Provider in tree")
  }
  return ctx
}
