"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"
import { z } from "zod"

const ArticleFiltersSchema = z.object({
  search: z.string(),
  tags: z.array(z.string()),
})

type ArticleFilters = z.infer<typeof ArticleFiltersSchema>

export const useArticleFilters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters: ArticleFilters = useMemo(() => {
    return ArticleFiltersSchema.parse({
      search: searchParams.get("q") ?? "",
      tags: searchParams.getAll("tag"),
    })
  }, [searchParams])

  const updateFilters = useCallback(
    (partial: Partial<ArticleFilters>) => {
      const params = new URLSearchParams(searchParams.toString())

      const next = { ...filters, ...partial }

      params.delete("q")
      params.delete("tag")

      if (next.search) {
        params.set("q", next.search)
      }

      for (const t of next.tags) {
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
