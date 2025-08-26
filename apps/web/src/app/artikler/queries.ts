import { useTRPC } from "@/utils/trpc/client"
import type { ArticleFilterQuery } from "@dotkomonline/types"

import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const useArticleAllQuery = () => {
  const trpc = useTRPC()
  return useQuery(trpc.article.all.queryOptions())
}

export const useArticleFilterQuery = (filters: ArticleFilterQuery) => {
  const trpc = useTRPC()

  const { data, ...query } = useInfiniteQuery({
    ...trpc.article.findArticles.infiniteQueryOptions({
      filters,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (res) => res.pages.flatMap((p) => p.items),
  })

  return { articles: useMemo(() => data ?? [], [data]), ...query }
}
