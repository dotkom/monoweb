"use client"

import { ArticleFilterQuerySchema } from "@dotkomonline/rpc/article"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"
import type { z } from "zod"

type ArticleFilters = z.infer<typeof ArticleFilterQuerySchema>

export const useArticleFilters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters: ArticleFilters = useMemo(() => {
    return ArticleFilterQuerySchema.parse({
      bySearchTerm: searchParams.get("q") ?? "",
      byTags: searchParams.getAll("tag"),
    })
  }, [searchParams])

  const updateFilters = useCallback(
    (partial: Partial<ArticleFilters>) => {
      const params = new URLSearchParams(searchParams.toString())

      const next = { ...filters, ...partial }

      params.delete("q")
      params.delete("tag")

      if (next.bySearchTerm) {
        params.set("q", next.bySearchTerm)
      }

      for (const t of next.byTags ?? []) {
        params.append("tag", t)
      }

      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams, filters]
  )

  const resetFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("q")
    params.delete("tag")
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  return {
    filters,
    updateFilters,
    resetFilters,
  }
}
