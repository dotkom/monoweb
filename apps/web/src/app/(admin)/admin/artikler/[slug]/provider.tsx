"use client"

import type { Article } from "@dotkomonline/rpc/article"
import { createContext, useContext } from "react"

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
