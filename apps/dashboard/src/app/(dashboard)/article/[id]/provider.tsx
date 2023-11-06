"use client"

import { createContext, useContext } from "react"
import { type Article } from "@dotkomonline/types"

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
